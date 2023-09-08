FROM golang:latest as builder
WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./...

FROM alpine:latest
ENV TZ=UTC
COPY --from=builder /app/main /app/
EXPOSE 5001
CMD ["/app/main"]