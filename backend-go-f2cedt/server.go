package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
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
	client, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	r.HandleFunc("/register", RegisterHandler).Methods("POST")
	r.HandleFunc("/login", LoginHandler).Methods("POST")
	r.HandleFunc("/create-battle", createBattleHandler).Methods("POST")
	r.HandleFunc("/join-battle", joinBattleHanlder).Methods("POST")
	// Add more routes as needed
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

