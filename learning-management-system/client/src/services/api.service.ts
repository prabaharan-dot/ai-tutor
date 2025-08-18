import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get authorization header from local storage
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Course related API calls
export const fetchCourses = async () => {
    const response = await axios.get(`${API_URL}/courses`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const fetchCourseById = async (id: string) => {
    const response = await axios.get(`${API_URL}/courses/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const enrollInCourse = async (courseId: string) => {
    const response = await axios.post(
        `${API_URL}/courses/${courseId}/enroll`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Quiz related API calls
export const fetchQuiz = async (courseId: string, moduleId: string) => {
    const response = await axios.get(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/quiz`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const submitQuiz = async (courseId: string, moduleId: string, answers: Array<{ questionId: string, answer: number }>) => {
    const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/quiz/submit`,
        { answers },
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getQuizStats = async (courseId: string, moduleId: string) => {
    const response = await axios.get(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/quiz/stats`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Leaderboard related API calls
export const getGlobalLeaderboard = async () => {
    const response = await axios.get(
        `${API_URL}/leaderboard`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getCourseLeaderboard = async (courseId: string) => {
    const response = await axios.get(
        `${API_URL}/leaderboard/courses/${courseId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getUserRanking = async (courseId?: string) => {
    const url = courseId
        ? `${API_URL}/leaderboard/courses/${courseId}/ranking`
        : `${API_URL}/leaderboard/ranking`;
    const response = await axios.get(url, { headers: getAuthHeader() });
    return response.data;
};
    );
    return response.data;
};

// Quiz related API calls
export const fetchQuizByModuleId = async (courseId: string, moduleId: string) => {
    const response = await axios.get(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/quiz`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const submitQuiz = async (
    courseId: string,
    moduleId: string,
    answers: { questionId: string; answer: number }[]
) => {
    const response = await axios.post(
        `${API_URL}/courses/${courseId}/modules/${moduleId}/quiz/submit`,
        { answers },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Progress tracking
export const updateModuleProgress = async (courseId: string, moduleId: string) => {
    const response = await axios.post(
        `${API_URL}/courses/${courseId}/progress`,
        { moduleId },
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const fetchUserProgress = async () => {
    const response = await axios.get(
        `${API_URL}/users/progress`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Leaderboard
export const fetchLeaderboard = async () => {
    const response = await axios.get(
        `${API_URL}/leaderboard`,
        { headers: getAuthHeader() }
    );
    return response.data;
};
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   │   ├── controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── course.controller.ts
│   │   │   └── quiz.controller.ts
│   │   ├── models
│   │   │   ├── user.model.ts
│   │   │   ├── course.model.ts
│   │   │   └── quiz.model.ts
│   │   ├── routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── course.routes.ts
│   │   │   └── quiz.routes.ts
│   │   ├── middleware
│   │   │   └── auth.middleware.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md