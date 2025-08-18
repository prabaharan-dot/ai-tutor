import React from 'react';

const CourseDetails: React.FC = () => {
    // Sample course data (this would typically come from an API)
    const course = {
        title: 'Introduction to React',
        description: 'Learn the basics of React, including components, state, and props.',
        modules: [
            { title: 'Module 1: Getting Started', content: 'Introduction to React and JSX.' },
            { title: 'Module 2: Components', content: 'Understanding functional and class components.' },
            { title: 'Module 3: State and Props', content: 'Managing state and passing props.' },
        ],
    };

    return (
        <div>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <h2>Modules</h2>
            <ul>
                {course.modules.map((module, index) => (
                    <li key={index}>
                        <h3>{module.title}</h3>
                        <p>{module.content}</p>
                    </li>
                ))}
            </ul>
            <button>Enroll Now</button>
        </div>
    );
};

export default CourseDetails;