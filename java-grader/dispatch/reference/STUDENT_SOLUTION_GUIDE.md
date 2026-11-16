# Emergency Dispatch Energy Planner API – Student Worked Solution

This is a worked solution to the **mock practice paper**. It is written using the programming concepts covered in Lectures 1–7. It is not a solution template for a live examination.

## What you should know before reading the code

The solution uses the following topics from the lecture series:

| Lecture | Concepts used in this solution |
|---|---|
| 1 | Java classes, objects, methods and Spring Boot application structure |
| 2 | Encapsulation, fields, constructors and access modifiers |
| 3 | `ArrayList`, collections, service layer and REST controllers |
| 4 | Inheritance and `super(...)` |
| 5 | Abstract classes, method overriding and polymorphism |
| 6 | Custom exceptions and centralised HTTP error handling |
| 7 | Spring IoC, constructor injection, `@Service`, `@Repository` and layered architecture |

This solution deliberately avoids later-week material such as Mockito-based testing, streams, records and database persistence. The dispatch sort uses an ordinary `Comparator` class and `Collections.sort()`.

## 1. Open and run the project

1. Extract the ZIP file.
2. Open the `drone-practice-starter` folder in IntelliJ IDEA.
3. Select Java 25 as the project JDK.
4. Allow Maven to load the dependencies.
5. Run `DispatchApplication.java`, or use `mvn spring-boot:run`.

The application runs at `http://localhost:8080`.

Swagger UI: `http://localhost:8080/swagger-ui.html`

## 2. Understand the layers

- **Controller:** receives HTTP requests and delegates to the service.
- **Service:** contains validation, calculations, lookup and dispatch planning.
- **Repository:** stores and retrieves mission objects.
- **Model:** contains the mission classes and response classes.
- **Exception:** contains custom exceptions and the central exception handler.

The supplied `MissionRepository` API is retained. The task says not to replace the supplied repository API unless explicitly instructed.

## 3. Task 1 – GroundMission

`GroundMission` already has its fields, constructor and `isMedical()` method.

The solution completes only the two requested TODO methods.

Energy formula:

`2 × distanceKm + 5 × loadKg`

Priority:
- Medical: 3
- Non-medical: 1

The calculation first uses `long` so multiplication and addition do not silently overflow an `int`. `Math.toIntExact` then safely converts the result to `int`.

## 4. Task 2 – AirMission and dispatch planning

### AirMission

`AirMission` extends the supplied abstract `DispatchMission` class.

It:
- calls `super(id, distanceKm, loadKg)` to initialise inherited values;
- stores `windPenalty` and `critical`;
- overrides `energyUnits()` and `priority()`.

Energy formula:

`3 × distanceKm + 8 × loadKg + 2 × windPenalty`

Priority:
- Critical: 5
- Non-critical: 2

### NewAirMission and AirMission are different

- `NewAirMission` is the supplied request model. Spring creates it from the JSON body sent to the POST endpoint.
- `AirMission` is the domain model created by the service. It extends `DispatchMission` and contains the mission behaviour.

The service validates the request, creates an `AirMission`, calculates its energy, and saves it in the repository.

### Dispatch planning

The service:
1. Gets all missions from the repository.
2. Applies the urgent-only filter when requested.
3. Sorts by priority descending, energy ascending and ID ascending.
4. Checks every eligible mission against the remaining capacity.
5. Adds a mission to `selected` if it fits; otherwise adds its ID to `skipped`.
6. Continues after a skipped mission.
7. Calculates `energyUsed` and `energyRemaining`.

The code uses the abstract `DispatchMission` methods. It does not check whether an object is a `GroundMission` or `AirMission`. This is polymorphism.

## 5. Task 3 – Validation, lookup and errors

`energy(id)` searches for a mission. If no mission exists, it throws `MissionNotFoundException`. Otherwise, it calls the mission's `energyUnits()` method.

`addAir(request)` validates:
- ID: 1–10,000
- distanceKm: 1–10,000
- loadKg: 0–10,000
- windPenalty: 0–10,000
- duplicate IDs are rejected.

The service calculates the energy before saving. Invalid input raises `IllegalArgumentException`.

`GlobalExceptionHandler` converts:
- `IllegalArgumentException` into HTTP 400 and `BAD_REQUEST`;
- `MissionNotFoundException` into HTTP 404 and `NOT_FOUND`.

This keeps HTTP error-response handling out of the service.

## 6. Task 4 – REST endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/missions` | Supplied endpoint: list missions |
| GET | `/missions/{id}/energy` | Return the mission energy |
| POST | `/missions/air` | Create an air mission |
| GET | `/missions/plan?capacity=60&urgentOnly=false` | Generate a dispatch plan |

`urgentOnly` defaults to `false` when omitted.

## 7. Try the expected examples

### Mission 101 energy

`GET http://localhost:8080/missions/101/energy`

Expected:

```json
{"energyUnits":39}
```

### Mission 103 energy

`GET http://localhost:8080/missions/103/energy`

Expected:

```json
{"energyUnits":38}
```

### Normal plan, capacity 60

`GET http://localhost:8080/missions/plan?capacity=60&urgentOnly=false`

Expected:
- Sorted IDs: `[103, 101, 102]`
- Selected IDs: `[103, 102]`
- Skipped IDs: `[101]`
- Energy used: `56`
- Energy remaining: `4`

Mission 101 does not fit after mission 103, but the algorithm continues and selects mission 102.

### Urgent-only plan, capacity 60

`GET http://localhost:8080/missions/plan?capacity=60&urgentOnly=true`

Expected:
- Selected IDs: `[103]`
- Skipped IDs: `[101]`
- Mission 102 is filtered out and appears in neither list.

### Add mission 104

`POST http://localhost:8080/missions/air`

Request body:

```json
{
  "id": 104,
  "distanceKm": 6,
  "loadKg": 1,
  "windPenalty": 2,
  "critical": false
}
```

Expected energy: `30`

Expected priority: `2`

After adding it, request:

`GET http://localhost:8080/missions/plan?capacity=125&urgentOnly=false`

Expected selected IDs: `[103, 101, 104, 102]`

Expected energy used: `125`

Expected energy remaining: `0`

## 8. Suggested way to study this solution

Do not just copy the code. For each task:
1. Read the task comment above the implementation.
2. Read the method signature.
3. Trace where the method is called.
4. Follow the request from controller to service to repository.
5. Run the example endpoint in Swagger UI.
6. Change one input and predict the result before running it.

This helps connect the Java OOP concepts from Lectures 1–5 with the Spring layers and dependency injection covered in Lectures 3, 6 and 7.
