# Architecture Documentation

## Table of Contents

- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Flow Diagrams](#api-flow-diagrams)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)


## System Architecture

### [High-Level Architecture](../assets/high-level-architecture.png)

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend - Next.js"
        UI[UI Components]
        API_Client[API Client]
    end

    subgraph "Backend - FastAPI"
        Router[API Routers]
        Service[Business Logic]
        Auth[Authentication]
        LLM[LLM Integration]
    end

    subgraph "AI/ML Services"
        Gemini[Google Gemini]
        OpenRouter[OpenRouter API]
        LangChain[LangChain/LangGraph]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
        Cloudinary[Cloudinary CDN]
    end

    Web --> UI
    Mobile --> UI
    UI --> API_Client
    API_Client --> Router
    Router --> Auth
    Router --> Service
    Service --> LLM
    LLM --> Gemini
    LLM --> OpenRouter
    LLM --> LangChain
    Service --> PostgreSQL
    Service --> Redis
    Service --> Cloudinary
```

### [Technology Stack](../assets/technology-stack.png)

```mermaid
graph LR
    subgraph "Frontend Stack"
        A[Next.js 15]
        B[TypeScript]
        C[Tailwind CSS]
        D[Redux Toolkit]
    end

    subgraph "Backend Stack"
        E[FastAPI]
        F[Python 3.12+]
        G[SQLAlchemy]
        H[Alembic]
    end

    subgraph "AI Stack"
        I[LangChain]
        J[LangGraph]
        K[Google Gemini]
        L[OpenRouter]
    end

    subgraph "Infrastructure"
        M[PostgreSQL]
        N[Redis]
        O[Docker]
        P[Cloudinary]
    end
```


## Database Schema

### Public Schema

![Public Schema](../assets/database_diagram_public_schema.svg)

#### Users Table

Stores user account information and authentication data.

**Columns:**

- `id` (UUID, PK) - Unique user identifier
- `username` (VARCHAR) - Unique username
- `email` (VARCHAR) - User email address
- `hashed_password` (VARCHAR) - Bcrypt hashed password
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

#### User Profiles Table

Contains detailed user profile and health information.

**Columns:**

- `id` (UUID, PK) - Profile identifier
- `user_id` (UUID, FK) - References users table
- `full_name` (VARCHAR) - User's full name
- `age` (INTEGER) - User age
- `gender` (VARCHAR) - Gender
- `weight` (FLOAT) - Current weight in kg
- `height` (FLOAT) - Height in cm
- `activity_level` (VARCHAR) - Activity level (sedentary, moderate, active)
- `goal` (VARCHAR) - Fitness goal (lose weight, maintain, gain muscle)
- `daily_calorie_target` (INTEGER) - Target calories per day
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Foods Table

Stores food items and their nutritional information.

**Columns:**

- `id` (UUID, PK) - Food item identifier
- `user_id` (UUID, FK) - Owner of the food entry
- `name` (VARCHAR) - Food name
- `calories` (FLOAT) - Calories per serving
- `protein` (FLOAT) - Protein in grams
- `carbs` (FLOAT) - Carbohydrates in grams
- `fats` (FLOAT) - Fats in grams
- `serving_size` (VARCHAR) - Serving size description
- `image_url` (VARCHAR) - Cloudinary image URL
- `created_at` (TIMESTAMP)

### Chat Schema
Used by LangGraph for conversation state management and checkpointing.

![Chat Schema](../assets/database_diagram_chat_schema.svg)



## API Flow Diagrams

### [User Registration Flow](../assets/user-registration-flow.png)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Auth as Auth Service

    C->>API: POST /auth/register
    Note over C,API: {username, email, password}

    API->>DB: Check if user exists
    DB-->>API: User not found

    API->>Auth: Hash password
    Auth-->>API: Hashed password

    API->>DB: Create user record
    DB-->>API: User created

    API->>DB: Create user profile
    DB-->>API: Profile created

    API-->>C: 201 Created
    Note over API,C: {user_id, username, email}
```

### [User Login Flow](../assets/user-login-flow.png)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Auth as Auth Service

    C->>API: POST /auth/login
    Note over C,API: {username, password}

    API->>DB: Find user by username
    DB-->>API: User data

    API->>Auth: Verify password
    Auth-->>API: Password valid

    API->>Auth: Generate JWT token
    Auth-->>API: Access token

    API-->>C: 200 OK
    Note over API,C: {access_token, token_type}
```

### [Food Image Analysis Flow](../assets/food-image-analysis-flow.png)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant Cloud as Cloudinary
    participant VLM as Vision LLM
    participant LLM as Text LLM
    participant DB as PostgreSQL

    C->>API: POST /analyze/image
    Note over C,API: Upload food image

    API->>Cloud: Upload image
    Cloud-->>API: Image URL

    API->>VLM: Analyze image
    Note over API,VLM: OpenRouter Vision API
    VLM-->>API: Food recognition data

    API->>LLM: Get nutrition info
    Note over API,LLM: Google Gemini
    LLM-->>API: Nutritional breakdown

    API->>DB: Save food entry
    DB-->>API: Entry saved

    API-->>C: 200 OK
    Note over API,C: {food_name, calories, macros}
```

### [AI Nutrition Advice Flow](../assets/ai-nutrition-advice-flow.png)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant LG as LangGraph
    participant DB as PostgreSQL
    participant LLM as Gemini LLM
    participant Cache as Redis

    C->>API: POST /advice
    Note over C,API: User query + context

    API->>Cache: Check cache
    Cache-->>API: Cache miss

    API->>DB: Get user profile
    DB-->>API: Profile data

    API->>LG: Initialize workflow
    LG->>LLM: Generate advice
    Note over LG,LLM: With user context
    LLM-->>LG: AI response

    LG->>DB: Save checkpoint
    DB-->>LG: Checkpoint saved

    LG-->>API: Advice generated

    API-->>C: 200 OK
    Note over API,C: {advice, recommendations}
```

## Component Architecture

### [Frontend Component Hierarchy](../assets/frontend-component-hierarchy.png)

```mermaid
graph TD
    App[App Layout]

    App --> Auth[Auth Pages]
    App --> Main[Main Pages]
    App --> Planner[Planner Pages]

    Auth --> Login[Login Page]
    Auth --> Register[Register Page]

    Main --> Dashboard[Dashboard]
    Main --> Profile[Profile Page]
    Main --> FoodList[Food List]

    Planner --> MealPlanner[Meal Planner]
    Planner --> Chatbot[AI Chatbot]

    Dashboard --> NutritionStats[Nutrition Stats]
    Dashboard --> Charts[Chart Components]

    Profile --> ProfileForm[Profile Form]
    Profile --> SettingsPanel[Settings]

    FoodList --> FoodCard[Food Card]
    FoodList --> FoodSearch[Search Bar]

    MealPlanner --> MealCard[Meal Card]
    MealPlanner --> PlannerForm[Planner Form]

    Chatbot --> ChatMessages[Message List]
    Chatbot --> ChatInput[Input Field]
```

### [Backend Module Structure](../assets/backend-module-structure.png)

```mermaid
graph TD
    Main[main.py]

    Main --> Routers[Routers]
    Main --> Services[Services]
    Main --> Database[Database]
    Main --> Models[AI Models]

    Routers --> AuthRouter[auth.py]
    Routers --> ProfileRouter[profile.py]
    Routers --> FoodRouter[food.py]
    Routers --> AnalysisRouter[analys.py]
    Routers --> AdviceRouter[advice.py]

    Services --> UserService[user_service.py]
    Services --> WorkflowService[workflow_service.py]
    Services --> CloudinaryService[cloudinary_service.py]

    Database --> DBModels[models.py]
    Database --> CRUD[crud.py]
    Database --> Connection[connection.py]

    Models --> ModelFactory[factory.py]
    Models --> Gemini[gemini.py]
    Models --> OpenRouter[openrouter.py]
```


## Data Flow

### [User Authentication Data Flow](../assets/user-authentication-data-flow.png)

```mermaid
flowchart LR
    A[User Input] --> B{Valid Credentials?}
    B -->|Yes| C[Hash Password]
    C --> D[Query Database]
    D --> E{User Exists?}
    E -->|No| F[Create User]
    E -->|Yes| G[Verify Password]
    G -->|Valid| H[Generate JWT]
    G -->|Invalid| I[Return Error]
    F --> J[Create Profile]
    J --> H
    H --> K[Return Token]
    I --> L[401 Unauthorized]
```

### [Food Entry Data Flow](../assets/food-entry-data-flow.png)

```mermaid
flowchart TB
    Start[User Upload Image] --> Upload[Upload to Cloudinary]
    Upload --> VLM[Vision Model Analysis]
    VLM --> Extract[Extract Food Data]
    Extract --> LLM[Get Nutrition Info]
    LLM --> Parse[Parse Response]
    Parse --> Validate{Valid Data?}
    Validate -->|Yes| Save[Save to Database]
    Validate -->|No| Error[Return Error]
    Save --> Cache[Update Cache]
    Cache --> Return[Return to User]
    Error --> Return
```

### [AI Advice Generation Flow](../assets/ai-advice-generation-flow.png)

```mermaid
flowchart TB
    Request[User Request] --> GetProfile[Fetch User Profile]
    GetProfile --> GetHistory[Fetch Food History]
    GetHistory --> BuildContext[Build Context]
    BuildContext --> InitGraph[Initialize LangGraph]
    InitGraph --> Node1[Context Analysis]
    Node1 --> Node2[Generate Advice]
    Node2 --> Node3[Validate Response]
    Node3 --> Save[Save Checkpoint]
    Save --> Stream{Streaming}
    Stream --> End[End]
```

### [State Management Flow (Frontend)](../assets/state-management-flow-frontend.png)

```mermaid
flowchart LR
    A[User Action] --> B[Dispatch Action]
    B --> C[Redux Middleware]
    C --> D{Async?}
    D -->|Yes| E[API Call]
    D -->|No| F[Reducer]
    E --> G{Success?}
    G -->|Yes| H[Update State]
    G -->|No| I[Error Handler]
    H --> F
    I --> F
    F --> J[Update UI]
```


## Integration Points

### [External Services Integration](../assets/external-services-integration.png)

```mermaid
graph TB
    subgraph "Macro Mate Backend"
        API[FastAPI Server]
    end

    subgraph "AI Services"
        Gemini[Google Gemini API]
        OpenRouter[OpenRouter API]
    end

    subgraph "Storage Services"
        Cloudinary[Cloudinary CDN]
        PostgreSQL[(PostgreSQL DB)]
        Redis[(Redis Cache)]
    end

    API -->|Text Analysis| Gemini
    API -->|Vision Analysis| OpenRouter
    API -->|Image Upload| Cloudinary
    API -->|Data Storage| PostgreSQL
    API -->|Caching| Redis

    Gemini -->|AI Response| API
    OpenRouter -->|Food Recognition| API
    Cloudinary -->|Image URL| API
    PostgreSQL -->|Query Results| API
    Redis -->|Cached Data| API
```


## [Deployment Architecture](../assets/deployment-architecture.png)

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]

        subgraph "Frontend Containers"
            FE1[Next.js Instance 1]
        end

        subgraph "Backend Containers"
            BE1[FastAPI Instance 1]
        end

        subgraph "Data Services"
            PG[(PostgreSQL)]
            RD[(Redis)]
        end
    end

    Users[Users] --> LB
    LB --> FE1
    FE1 --> BE1
    BE1 --> PG
    BE1 --> RD
```


## [Security Architecture](../assets/security-architecture.png)

```mermaid
flowchart TB
    Request[Incoming Request] --> CORS{CORS Check}
    CORS -->|Valid| Auth{Has Token?}
    CORS -->|Invalid| Reject1[403 Forbidden]
    Auth -->|Yes| Validate[Validate JWT]
    Auth -->|No| Public{Public Endpoint?}
    Public -->|Yes| Process[Process Request]
    Public -->|No| Reject2[401 Unauthorized]
    Validate -->|Valid| AuthZ{Authorized?}
    Validate -->|Invalid| Reject3[401 Invalid Token]
    AuthZ -->|Yes| Process
    AuthZ -->|No| Reject4[403 Forbidden]
    Process --> Response[Return Response]
```


For more detailed information about specific components, please refer to:

- [API Documentation](../README.md#api-documentation)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)
