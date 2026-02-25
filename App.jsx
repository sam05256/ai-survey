import React, { useState } from 'react';
import { Bot, Sparkles, Code, Terminal, ChevronRight, ChevronLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZ1Dx6_-2RatzzGw9vd-8gOdLrqxK4BoLWii96cA_KH_GhehIb9AclIo3CC6A5cOBPJw/exec";

const totalQuestions = 8; 

const QuestionWrapper = ({ stepNum, title, subtitle, children }) => (
  <div className="w-full max-w-2xl mx-auto flex flex-col justify-center min-h-[60vh] animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="mb-8">
      <span className="text-indigo-400 font-bold tracking-widest text-sm bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
        질문 {stepNum} / {totalQuestions}
      </span>
      <h2 className="text-2xl md:text-3xl font-bold mt-6 leading-tight text-white">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-3 text-sm md:text-base">{subtitle}</p>}
    </div>
    <div className="w-full">
      {children}
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: [],
    q2_other: '',
    q3: [],
    q3_other: '',
    q4: '',
    q4_detail: '',
    q5: [],
    q6: '',
    q7: '',
    q8: '' 
  });

  const handleSingleChoice = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    setErrorMsg('');
  };

  const handleMultiChoice = (questionId, value) => {
    const currentAnswers = answers[questionId];
    if (currentAnswers.includes(value)) {
      setAnswers({ ...answers, [questionId]: currentAnswers.filter(item => item !== value) });
    } else {
      setAnswers({ ...answers, [questionId]: [...currentAnswers, value] });
    }
    setErrorMsg('');
  };

  const handleTextChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (value.trim() !== '') setErrorMsg('');
  };

  const targetOption1 = 'AI가 작성해 준 코드를 활용해 웹/앱 서비스나 간단한 프로그램을 만들어 봤어요.';
  const targetOption2 = 'OpenAI API 등을 직접 코딩으로 연동하여 AI 서비스를 구축해 봤어요.';

  const validateStep = () => {
    switch(step) {
      case 1: return answers.q1 !== '';
      case 2: return answers.q2.length > 0 || answers.q2_other.trim() !== '';
      case 3: return answers.q3.length > 0 || answers.q3_other.trim() !== '';
      case 4: return answers.q4 !== '' && (answers.q4 === '없어요' || answers.q4_detail.trim() !== '');
      case 5: return answers.q5.length > 0;
      case 6: return answers.q6.trim() !== '';
      case 7: return answers.q7 !== '';
      default: return true;
    }
  };

  const nextStep = async () => {
    if (step > 0 && step <= totalQuestions && !validateStep()) {
      setErrorMsg('답변을 선택하거나 입력해 주세요. 🙏');
      return;
    }
    setErrorMsg('');

    if (step === 5) {
      const hasAdvancedExperience = answers.q5.includes(targetOption1) || answers.q5.includes(targetOption2);
      if (!hasAdvancedExperience) {
        setStep(7);
        return;
      }
    }

    if (step === totalQuestions) {
      setIsSubmitting(true);
      try {
        // 구글 시트로 데이터 전송
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // CORS 정책 우회를 위해 필수
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers)
        });
        
        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공했다고 가정하고 넘어갑니다.
        setStep(prev => prev + 1);
      } catch (error) {
        console.error("Submission error:", error);
        setErrorMsg('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    if (step === 7) {
      const hasAdvancedExperience = answers.q5.includes(targetOption1) || answers.q5.includes(targetOption2);
      if (!hasAdvancedExperience) {
        setStep(5);
        return;
      }
    }
    setStep(prev => prev - 1);
  };

  const progress = (step / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-24 flex flex-col">
      {step > 0 && step <= totalQuestions && (
        <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-800 z-50">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-12 flex flex-col">
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20 transform rotate-12 hover:rotate-0 transition-transform">
              <Bot size={48} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight">
              생성형 AI 활용
              <br />수강생 사전 조사
            </h1>
            <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
              환영합니다! 이번 학기 수업의 방향성을 맞추기 위해 여러분의 경험을 여쭤보고자 합니다. 
              <br/>성적과는 무관하니 편하게 답변해주세요! 🚀
            </p>
            <button 
              onClick={nextStep}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:bg-indigo-500 focus:outline-none shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]"
            >
              <span className="mr-2">설문 시작하기</span>
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
            </button>
          </div>
        )}

        {/* 질문 1~8 및 완료 화면 로직 동일 (답변 선택지는 이전과 동일하게 유지) */}
        {step === 1 && (
          <QuestionWrapper stepNum={1} title="평소 생성형 AI 서비스(ChatGPT, Gemini 등)를 얼마나 자주 사용하시나요?">
            <div className="flex flex-col gap-3">
              {['거의 매일 사용해요.', '일주일에 3~4번 정도 사용해요.', '일주일에 1~2번 정도 사용해요.', '한 달에 1~2번 정도 가끔 사용해요.', '거의 사용해 본 적 없어요.'].map((option, idx) => (
                <button key={idx} onClick={() => handleSingleChoice('q1', option)} className={`p-4 md:p-5 rounded-2xl text-left border transition-all duration-200 ${answers.q1 === option ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 translate-x-2' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>{option}</button>
              ))}
            </div>
          </QuestionWrapper>
        )}

        {step === 2 && (
          <QuestionWrapper stepNum={2} title="생성형 AI를 주로 어떤 목적으로 사용하시나요?" subtitle="* 해당하는 항목을 모두 선택해 주세요 (복수 응답 가능)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['일상 생활 궁금증 해소 및 대화', '취미 생활 (SNS 콘텐츠, 이미지 생성 등)', '글쓰기 (자소서, 이메일 등)', '과제 자료 조사', '외국어 번역 및 문법 교정', '코딩 문제 해결 및 작성 보조'].map((option, idx) => (
                <button key={idx} onClick={() => handleMultiChoice('q2', option)} className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3 ${answers.q2.includes(option) ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-colors ${answers.q2.includes(option) ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>{answers.q2.includes(option) && <CheckCircle2 className="w-4 h-4 text-white" />}</div>{option}
                </button>
              ))}
              <input type="text" placeholder="기타 목적이 있다면 입력해 주세요..." value={answers.q2_other} onChange={(e) => handleTextChange('q2_other', e.target.value)} className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
            </div>
          </QuestionWrapper>
        )}

        {step === 3 && (
          <QuestionWrapper stepNum={3} title="현재 사용해 본 적이 있는 AI 서비스는 무엇인가요?" subtitle="* 복수 응답 가능">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['ChatGPT (OpenAI)', 'Gemini (Google)', 'Claude (Anthropic)', '뤼튼, 코파일럿 등 포털/국내 챗봇', 'GitHub Copilot, Cursor 등 코딩 전용 AI', 'Midjourney, 나노바나나 등 이미지 생성 AI'].map((option, idx) => (
                <button key={idx} onClick={() => handleMultiChoice('q3', option)} className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3 ${answers.q3.includes(option) ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-colors ${answers.q3.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>{answers.q3.includes(option) && <CheckCircle2 className="w-4 h-4 text-white" />}</div>{option}
                </button>
              ))}
              <input type="text" placeholder="기타 서비스가 있다면 입력해 주세요..." value={answers.q3_other} onChange={(e) => handleTextChange('q3_other', e.target.value)} className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
            </div>
          </QuestionWrapper>
        )}

        {step === 4 && (
          <QuestionWrapper stepNum={4} title="현재 유료로 구독 중이거나 결제해서 사용해 본 서비스가 있나요?">
            <div className="space-y-4">
              <button onClick={() => handleSingleChoice('q4', '없어요')} className={`w-full p-5 rounded-2xl text-left border transition-all duration-200 ${answers.q4 === '없어요' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 translate-x-2' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>없어요. (무료 버전만 사용해요)</button>
              <div className={`w-full p-5 rounded-2xl text-left border transition-all duration-200 ${answers.q4 === '있어요' ? 'bg-indigo-600/20 border-indigo-500 translate-x-2' : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                <label className="flex items-center cursor-pointer w-full" onClick={() => handleSingleChoice('q4', '있어요')}><span className={`text-lg ${answers.q4 === '있어요' ? 'text-indigo-300' : 'text-slate-300'}`}>있어요. (아래에 구독 중인 서비스를 적어주세요)</span></label>
                {answers.q4 === '있어요' && <input type="text" placeholder="예: ChatGPT Plus, GitHub Copilot 등" value={answers.q4_detail} onChange={(e) => handleTextChange('q4_detail', e.target.value)} className="mt-4 w-full bg-slate-950 border border-indigo-500/50 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500" />}
              </div>
            </div>
          </QuestionWrapper>
        )}

        {step === 5 && (
          <QuestionWrapper stepNum={5} title="AI를 활용하여 무언가를 직접 만들어 본 경험이 있나요?">
            <div className="flex flex-col gap-3">
              {['아직 직접 만들어본 적은 없어요. 이번 학기에 멋진 첫 작품을 만들어보고 싶어요! ✨', 'AI의 도움을 받아 자기소개서, 리포트, 블로그 글 등을 완성해 봤어요.', '프롬프트를 정교하게 다듬어 원하는 이미지, 음악, 영상 등을 제작해 봤어요.', 'GPTs 등을 이용해 나만의 맞춤형 챗봇(Custom GPT)을 만들어 봤어요.', 'AI가 작성해 준 코드를 활용해 웹/앱 서비스나 간단한 프로그램을 만들어 봤어요.', 'OpenAI API 등을 직접 코딩으로 연동하여 AI 서비스를 구축해 봤어요.'].map((option, idx) => (
                <button key={idx} onClick={() => handleMultiChoice('q5', option)} className={`p-4 md:p-5 rounded-2xl text-left border transition-all flex items-start gap-3 ${answers.q5.includes(option) ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-colors ${answers.q5.includes(option) ? 'bg-pink-500 border-pink-500' : 'border-slate-600'}`}>{answers.q5.includes(option) && <CheckCircle2 className="w-4 h-4 text-white" />}</div>{option}
                </button>
              ))}
            </div>
          </QuestionWrapper>
        )}

        {step === 6 && (
          <QuestionWrapper stepNum={6} title="가장 기억에 남는 생성물이나 프로젝트가 있다면 간단히 적어주세요." subtitle="* 코딩이나 API 활용 경험이 있는 분들을 위한 질문입니다.">
            <textarea rows="6" placeholder="예: 나만의 웹사이트 등..." value={answers.q6} onChange={(e) => handleTextChange('q6', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
          </QuestionWrapper>
        )}

        {step === 7 && (
          <QuestionWrapper stepNum={7} title="현재 본인의 프로그래밍(코딩) 경험은 어느 정도인가요?">
            <div className="flex flex-col gap-3">
              {['아직 코딩 경험은 없어요. 이번 수업에서 즐겁게 첫걸음을 떼고 싶어요! 🐣', 'C언어, 파이썬 등의 기초 문법만 조금 배워봤어요.', '작은 프로그램을 스스로 만들 수 있어요.', '이미 여러 언어를 다룰 줄 알며, 웹/앱/AI 관련 프로젝트 경험이 있어요.'].map((option, idx) => (
                <button key={idx} onClick={() => handleSingleChoice('q7', option)} className={`p-4 md:p-5 rounded-2xl text-left border transition-all duration-200 ${answers.q7 === option ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 translate-x-2' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'}`}>{option}</button>
              ))}
            </div>
          </QuestionWrapper>
        )}

        {step === 8 && (
          <QuestionWrapper stepNum={8} title="마지막으로 수업에 바라는 점이 있다면 자유롭게 적어주세요. 💬" subtitle="* 선택사항입니다.">
            <textarea rows="6" placeholder="자유롭게 적어주세요..." value={answers.q8} onChange={(e) => handleTextChange('q8', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
          </QuestionWrapper>
        )}

        {step > totalQuestions && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]">
              <CheckCircle2 size={56} className="text-green-400" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">설문 완료!</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">성실하게 답변해 주셔서 감사합니다. 😊</p>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 text-sm text-slate-500 max-w-sm flex flex-col items-center">
              <Terminal className="w-5 h-5 mb-2 opacity-50" />
              <span className="text-emerald-400 text-center font-medium">데이터가 구글 시트에 실시간으로 기록되었습니다!</span>
            </div>
          </div>
        )}
      </main>

      {step > 0 && step <= totalQuestions && (
        <div className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-md border-t border-slate-800 z-40">
          {errorMsg && <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">{errorMsg}</div>}
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><ChevronLeft className="w-5 h-5" /> 이전</button>
            <button onClick={nextStep} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50">
              {isSubmitting ? <><Loader2 className="w-4 h-4 ml-1 animate-spin" /> 저장 중</> : step === totalQuestions ? <>제출하기 <Send className="w-4 h-4 ml-1" /></> : <>다음 <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}