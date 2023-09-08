package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// User represents a user schema
type User struct {
	Name string `bson:"name" json:"name"`
	UID  string `bson:"uid" json:"uid"`
}

// BattleRoom represents a battle room schema
type BattleRoom struct {
	RoomID    string `bson:"roomId" json:"roomId"`
	ProblemID string `bson:"problemId" json:"problemId"`
	Creator   string `bson:"creator" json:"creator"`
	Opponent  string `bson:"opponent" json:"opponent"`
	Active    bool   `bson:"active" json:"active"`
}

// Problem represents a problem schema
type Problem struct {
	Title       string    `bson:"title" json:"title"`
	Description string    `bson:"description" json:"description"`
	Difficulty  string    `bson:"difficulty" json:"difficulty"`
	TestCases   []TestCase `bson:"testCases" json:"testCases"`
	Solution    string    `bson:"solution" json:"solution"`
}

// TestCase represents a single test case
type TestCase struct {
	Input  string `bson:"input" json:"input"`
	Output string `bson:"output" json:"output"`
}

var client *mongo.Client

func main() {
	r := mux.NewRouter()

	// Connect to MongoDB
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	r.HandleFunc("/register", RegisterHandler).Methods("POST")
	r.HandleFunc("/login", LoginHandler).Methods("POST")
	r.HandleFunc("/create-battle", createBattleHandler).Methods("POST")
	r.HandleFunc("/join-battle", joinBattleHanlder).Methods("POST")
	r.HandleFunc("/problems", ListProblemsHandler).Methods("GET")
    r.HandleFunc("/problems/{id}", GetProblemHandler).Methods("GET")
	r.HandleFunc("/submit-solution", SubmitSolutionHandler).Methods("POST")
    r.HandleFunc("/delete-battle/{roomId}", DeleteBattleHandler).Methods("DELETE")
    r.HandleFunc("/delete-user/{uid}", DeleteUserHandler).Methods("DELETE")

	fmt.Println("Server started at port 5001")
	http.ListenAndServe(":5001", r)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var newUser User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if user already exists and insert if not
	// Note: This is a basic example, additional error handling needed

	collection := client.Database("codingBattle").Collection("users")
	filter := bson.M{"name": newUser.Name}
	foundUser := &User{}
	err = collection.FindOne(context.Background(), filter).Decode(foundUser)

	if err == nil {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}

	newUser.UID = generateUID()
	_, err = collection.InsertOne(context.Background(), newUser)
	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"uid": newUser.UID})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if user exists
	// Note: This is a basic example, additional error handling needed

	collection := client.Database("codingBattle").Collection("users")
	filter := bson.M{"name": user.Name}
	foundUser := &User{}
	err = collection.FindOne(context.Background(), filter).Decode(foundUser)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"uid": foundUser.UID})
}

func generateUID() string {
	return fmt.Sprintf("%v", rand.Int31())[0:8]
}

// Add more handlers as needed
func createBattleHandler(w http.ResponseWriter, r *http.Request) {
	var roomRequest struct {
		Creator   string `bson:"creator" json:"creator"`
		ProblemID string `bson:"problemId" json:"problemId"`
	}
	err := json.NewDecoder(r.Body).Decode(&roomRequest)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var newBattleRoom = BattleRoom{
		RoomID:    generateUID(),
		ProblemID: roomRequest.ProblemID,
		Creator:   roomRequest.Creator,
		Opponent:  "",
		Active:    true,
	}
	
	collection := client.Database("codingBattle").Collection("battlerooms")
	_, err = collection.InsertOne(context.Background(), newBattleRoom)
	if err != nil {
		http.Error(w, "Failed to create battle room", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"roomId": newBattleRoom.RoomID})
}

func joinBattleHanlder(w http.ResponseWriter, r *http.Request) {
	var joinRequest struct {
		RoomID string `bson:"roomId" json:"roomId"`
		Name string `bson:"name" json:"name"`
	}

	err := json.NewDecoder(r.Body).Decode(&joinRequest)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	collection := client.Database("codingBattle").Collection("battlerooms")
    filter := bson.M{"roomId": joinRequest.RoomID, "active": true}
    update := bson.M{"$set": bson.M{"opponent": joinRequest.Name, "active": false}}

    result, err := collection.UpdateOne(context.Background(), filter, update)
    if err != nil {
        http.Error(w, "Failed to join battle", http.StatusInternalServerError)
        return
    }

    if result.MatchedCount == 0 {
        http.Error(w, "Room not found or already full", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Joined successfully"))
}

func ListProblemsHandler(w http.ResponseWriter, r *http.Request) {
    collection := client.Database("codingBattle").Collection("problems")
    
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        http.Error(w, "Failed to retrieve problems", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(context.Background())

    var problems []Problem
    if err = cursor.All(context.Background(), &problems); err != nil {
        http.Error(w, "Failed to parse problems", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(problems)
}

func GetProblemHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    problemID := vars["id"]

    collection := client.Database("codingBattle").Collection("problems")
    
    objID, err := primitive.ObjectIDFromHex(problemID)
    if err != nil {
        http.Error(w, "Invalid problem ID format", http.StatusBadRequest)
        return
    }

    filter := bson.M{"_id": objID}
    var problem Problem
    err = collection.FindOne(context.Background(), filter).Decode(&problem)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            http.Error(w, "Problem not found", http.StatusNotFound)
        } else {
            http.Error(w, "Failed to retrieve problem", http.StatusInternalServerError)
        }
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(problem)
}

func SubmitSolutionHandler(w http.ResponseWriter, r *http.Request) {
    var submissionRequest struct {
        RoomID      string `json:"roomId"`
        Code        string `json:"code"`
        LanguageID  int    `json:"languageId"`
        ProblemID   string `json:"problemId"`
        Name        string `json:"name"`
    }

    err := json.NewDecoder(r.Body).Decode(&submissionRequest)
    if err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    collection := client.Database("codingBattle").Collection("problems")
    objID, err := primitive.ObjectIDFromHex(submissionRequest.ProblemID)
    if err != nil {
        http.Error(w, "Invalid problem ID format", http.StatusBadRequest)
        return
    }

    filter := bson.M{"_id": objID}
    var problem Problem
    err = collection.FindOne(context.Background(), filter).Decode(&problem)
    if err != nil {
        http.Error(w, "Problem not found", http.StatusNotFound)
        return
    }

    allTestCasesPassed := true
    for _, testCase := range problem.TestCases {
        if !submitSubmission(submissionRequest.Code, submissionRequest.LanguageID, testCase.Input, testCase.Output) {
            allTestCasesPassed = false
            break
        }
    }

    if allTestCasesPassed {
        battleCollection := client.Database("codingBattle").Collection("battlerooms")
        filter := bson.M{"roomId": submissionRequest.RoomID}
        update := bson.M{"$set": bson.M{"active": false}}
        _, err = battleCollection.UpdateOne(context.Background(), filter, update)
        if err != nil {
            http.Error(w, "Failed to update battle room status", http.StatusInternalServerError)
            return
        }
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(submissionRequest.Name + " is the winner!"))
    } else {
        http.Error(w, "Solution did not pass all test cases", http.StatusBadRequest)
    }
}

func submitSubmission(code string, languageID int, input string, expectedOutput string) bool {
	judge0ApiUrl := os.Getenv("JUDGE0_API_URL")
	if judge0ApiUrl == "" {
		judge0ApiUrl = "http://54.175.132.186:2358"  // Default URL
	}

    judge0BaseUrl := judge0ApiUrl + "/submissions?base64_encoded=false&wait=true"

    // Structs for sending and receiving data from Judge0 API
    type SubmissionData struct {
        SourceCode     string `json:"source_code"`
        LanguageID     int    `json:"language_id"`
        Stdin          string `json:"stdin"`
        ExpectedOutput string `json:"expected_output,omitempty"`
    }
    
    type SubmissionResponse struct {
        Status struct {
            Description string `json:"description"`
        } `json:"status"`
        Output string `json:"stdout"`
    }

    data := SubmissionData{
        SourceCode:     code,
        LanguageID:     languageID,
        Stdin:          input,
        ExpectedOutput: expectedOutput,
    }

    jsonData, err := json.Marshal(data)
    if err != nil {
        log.Println("Failed to marshal submission data:", err)
        return false
    }

    resp, err := http.Post(judge0BaseUrl, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        log.Println("Failed to submit to Judge0 API:", err)
        return false
    }
    defer resp.Body.Close()

    var response SubmissionResponse
    err = json.NewDecoder(resp.Body).Decode(&response)
    if err != nil {
        log.Println("Failed to decode Judge0 response:", err)
        return false
    }

    // Check if submission was accepted by comparing with expected output
    return response.Status.Description == "Accepted" && strings.TrimSpace(response.Output) == strings.TrimSpace(expectedOutput)
}


func DeleteBattleHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    roomID := vars["roomId"]

    collection := client.Database("codingBattle").Collection("battlerooms")
    filter := bson.M{"roomId": roomID}
    _, err := collection.DeleteOne(context.Background(), filter)
    if err != nil {
        http.Error(w, "Failed to delete battle room", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Deleted successfully"))
}

func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    uid := vars["uid"]

    collection := client.Database("codingBattle").Collection("users")
    filter := bson.M{"uid": uid}
    _, err := collection.DeleteOne(context.Background(), filter)
    if err != nil {
        http.Error(w, "Failed to delete user", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Deleted successfully"))
}






