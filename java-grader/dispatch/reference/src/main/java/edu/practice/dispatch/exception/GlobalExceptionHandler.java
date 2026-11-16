package edu.practice.dispatch.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/*
 * TASK 3.3 – Map IllegalArgumentException to HTTP 400 and return an ErrorResponse
 * with code BAD_REQUEST. Map MissionNotFoundException to HTTP 404 and return an
 * ErrorResponse with code NOT_FOUND. Each error response must contain a descriptive
 * message. Do not return HTTP 200 for an error.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MissionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleMissionNotFound(
            MissionNotFoundException exception) {
        ErrorResponse error = new ErrorResponse(
                "NOT_FOUND", exception.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(
            IllegalArgumentException exception) {
        ErrorResponse error = new ErrorResponse(
                "BAD_REQUEST", exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
