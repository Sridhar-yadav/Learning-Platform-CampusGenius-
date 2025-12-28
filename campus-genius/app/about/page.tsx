import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Campus Genius",
  description: "Learn more about Campus Genius - Your all-in-one campus management platform",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Campus Genius</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Campus Genius is dedicated to revolutionizing the educational experience by providing a comprehensive platform that connects students and faculty in a seamless, efficient, and engaging way.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We believe in making education more accessible, interactive, and effective through technology-driven solutions that enhance both teaching and learning experiences.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Easy access to course materials and resources</li>
                <li>Interactive learning experiences</li>
                <li>Real-time communication with faculty</li>
                <li>Progress tracking and performance analytics</li>
                <li>Collaborative study tools</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">For Faculty</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Streamlined course management</li>
                <li>Advanced assessment tools</li>
                <li>Student progress monitoring</li>
                <li>Resource sharing capabilities</li>
                <li>Analytics and reporting features</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Campus Genius is built by a team of passionate educators, developers, and designers who understand the challenges and opportunities in modern education.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We continuously work to improve our platform based on feedback from our users and the latest developments in educational technology.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We're always looking for educational institutions, faculty members, and students to join our platform and help shape the future of education.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Whether you're a student looking to enhance your learning experience or a faculty member seeking to improve your teaching methods, Campus Genius is here to support your educational journey.
          </p>
        </section>
      </div>
    </div>
  );
} 