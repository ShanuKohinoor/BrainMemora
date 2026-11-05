import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

import { showQuizResult } from "../services/quizService";
import type { Quiz } from "../types/quiz.types";
import type { QuizResult } from "../types/quizResult.types";

interface QuizAssessmentProps {
  quiz: Quiz;
  onClose: () => void;
  onPassed: () => void;
}


const QuizAssessment = ({ quiz, onClose ,onPassed}: QuizAssessmentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    Array(quiz.questions.length).fill("")
  );

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(updatedAnswers);
  };

  const handleFinishQuiz = async () => {
    if (selectedAnswers.some((answer) => !answer)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setLoading(true);
      setError("");

        const response = await showQuizResult(quiz._id, selectedAnswers);

        setQuizResult(response.data);
        setPercentage(response.percentage);

        // Notify the parent if the quiz is passed
        if (response.percentage >= 80) {
            onPassed();
        }


    } catch (error) {
      console.error("Quiz submission failed:", error);
      setError("Unable to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show quiz results after submission.
  if (quizResult) {
    const passed = percentage >= 80;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
          <button onClick={onClose} className="float-right">
            <X />
          </button>

          <h2 className="text-2xl font-bold text-[#2D4030]">
            Quiz Results
          </h2>

          <p className="mt-4 text-4xl font-bold">
            {percentage.toFixed(0)}%
          </p>

          <p className={passed ? "text-green-600" : "text-red-600"}>
            {passed ? "Quiz Passed!" : "Quiz Not Passed"}
          </p>

          <p className="mt-2 text-gray-600">
            You scored {quizResult.correctAnswers} out of{" "}
            {quizResult.totalQuestions}.
          </p>

          <div className="mt-6 max-h-80 space-y-4 overflow-y-auto">
            {quizResult.answers.map((answer, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  answer.isCorrect
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <p className="font-semibold">
                  {index + 1}. {answer.question}
                </p>

                <p className="mt-2 text-sm">
                  Your answer: {answer.selectedAnswer}
                </p>

                <p className="text-sm">
                  Correct answer: {answer.correctAnswer}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-[#2D4030] px-5 py-2 text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2D4030]">
            {quiz.title}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>

        <h3 className="mt-5 text-lg font-semibold">
          {currentQuestion.question}
        </h3>

        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(option)}
              className={`w-full rounded-lg border p-3 text-left ${
                selectedAnswers[currentQuestionIndex] === option
                  ? "border-[#F27A58] bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() =>
              setCurrentQuestionIndex((previous) => previous - 1)
            }
            className="flex items-center gap-2 rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestionIndex((previous) => previous + 1)
              }
              className="flex items-center gap-2 rounded-lg bg-[#F27A58] px-4 py-2 text-white"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinishQuiz}
              disabled={loading}
              className="rounded-lg bg-[#2D4030] px-5 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Finish Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAssessment;