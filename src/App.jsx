import { useState, useEffect } from 'react';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, totalAnswered: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // const fetchQuestions = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
  //     if (!response.ok) throw new Error('Gagal mengambil data soal');
  //     const data = await response.json();
      
  //     if (data.results) {
  //       const formattedQuestions = data.results.map((q) => {
  //         const allAnswers = [...q.incorrect_answers, q.correct_answer];
  //         return {
  //           ...q,
  //           shuffled_answers: allAnswers.sort(() => Math.random() - 0.5)
  //         };
  //       });
  //       setQuestions(formattedQuestions);
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const [timeLeft, setTimeLeft] = useState(60); // Waktu 60 detik

useEffect(() => {
  // Jangan jalankan timer kalau kuis sudah selesai atau belum ada soal
  if (isFinished || questions.length === 0) return;

  // Berhenti kalau waktu habis
  if (timeLeft === 0) {
    setIsFinished(true);
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer); // Bersihkan timer saat pindah soal/komponen hancur
}, [timeLeft, isFinished, questions.length]);

  const fetchQuestions = async () => {
  setLoading(true);
  // Data dummy agar tidak perlu nunggu API
  const dummyData = [
    {
      question: "Apa ibukota Indonesia?",
      correct_answer: "Jakarta",
      incorrect_answers: ["Bandung", "Surabaya", "Medan"]
    },
    {
      question: "Siapa pembuat React?",
      correct_answer: "Meta",
      incorrect_answers: ["Google", "Microsoft", "Apple"]
    }
  ];

  const formatted = dummyData.map((q) => {
    const allAnswers = [...q.incorrect_answers, q.correct_answer];
    return { ...q, shuffled_answers: allAnswers.sort(() => Math.random() - 0.5) };
  });

  setQuestions(formatted);
  setLoading(false);
};
  
  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    setScore((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      totalAnswered: prev.totalAnswered + 1,
    }));

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

// Simpan progres setiap kali ada perubahan
useEffect(() => {
  if (questions.length > 0) {
    const quizData = { currentIndex, score, timeLeft };
    localStorage.setItem('quiz_progress', JSON.stringify(quizData));
  }
}, [currentIndex, score, timeLeft, questions]);

// Muat data saat pertama kali buka (Tambahkan di dalam useEffect yang sudah ada)
useEffect(() => {
  const savedData = localStorage.getItem('quiz_progress');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    setCurrentIndex(parsed.currentIndex);
    setScore(parsed.score);
    setTimeLeft(parsed.timeLeft);
  }
}, []);

  // --- KONDISI LOADING & ERROR ---
  if (loading) return <div className="text-center mt-20">Memuat Soal...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  // Pelindung agar tidak crash saat questions kosong
  if (questions.length === 0) return <div className="text-center mt-20">Tidak ada soal tersedia.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between mb-4 text-sm font-medium text-gray-500"></div>
        {!isFinished ? (
          <div>
            <div className={`text-right font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-blue-600'}`}>
              ⏱️ Sisa Waktu: {timeLeft}s
            </div>

            <div className="flex justify-between mb-4 text-sm font-medium text-gray-500">
              <span>Soal {currentIndex + 1} dari {questions.length}</span>
              <span>Skor: {score.correct}</span>
            </div>
            
            <h2 
              className="text-xl font-bold mb-6 text-gray-800"
              dangerouslySetInnerHTML={{ __html: questions[currentIndex].question }} 
            />

            <div className="space-y-3">
              {questions[currentIndex].shuffled_answers.map((ans, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(ans)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  dangerouslySetInnerHTML={{ __html: ans }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Kuis Selesai! 🎉</h2>
            <div className="space-y-2 text-lg">
              <p>Total Soal: {questions.length}</p>
              <p className="text-green-600">Benar: {score.correct}</p>
              <p className="text-red-600">Salah: {score.incorrect}</p>
              <p className="font-bold text-blue-600">Dijawab: {score.totalAnswered}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Main Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;