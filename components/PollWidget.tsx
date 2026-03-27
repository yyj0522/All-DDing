'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PollWidgetProps {
  pollId: number; // 어드민에서 확인한 투표 ID를 여기에 넘겨주면 돼!
}

export default function PollWidget({ pollId }: PollWidgetProps) {
  const [poll, setPoll] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // 이미 이 브라우저에서 투표했는지 확인
    const voted = localStorage.getItem(`hasVoted_poll_${pollId}`);
    if (voted) setHasVoted(true);

    const fetchPollData = async () => {
      const { data } = await supabase.from('polls').select('*').eq('id', pollId).single();
      if (data) setPoll(data);
    };
    fetchPollData();
  }, [pollId]);

  const handleVote = async (selectedOption: string) => {
    setIsVoting(true);
    try {
      // 선택한 옵션을 vote_type에 그대로 저장해!
      await supabase.from('feature_votes').insert([{ poll_id: pollId, vote_type: selectedOption }]);
    } catch (error) {
      console.error('투표 저장 실패:', error);
    } finally {
      localStorage.setItem(`hasVoted_poll_${pollId}`, 'true');
      setHasVoted(true);
      setIsVoting(false);
    }
  };

  if (!poll) return null; // 투표 데이터가 없으면 아예 안 보임

  return (
    <div className="bg-white dark:bg-[#111] border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors">
      <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2 transition-colors">
        {poll.title}
      </h4>
      {poll.description && (
        <p className="text-[11px] text-gray-700 dark:text-gray-400 leading-relaxed break-keep mb-5 transition-colors">
          {poll.description}
        </p>
      )}
      
      {poll.status === 'closed' ? (
        <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">
            종료된 투표입니다. 곧 결과가 공지됩니다.
          </p>
        </div>
      ) : !hasVoted ? (
        <div className="flex flex-col gap-2">
          {poll.options?.map((opt: string, idx: number) => (
            <button 
              key={idx}
              onClick={() => handleVote(opt)}
              disabled={isVoting}
              className={`w-full font-bold py-2.5 rounded-lg text-[13px] transition-colors shadow-sm disabled:opacity-50 ${idx === 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
            >
              {isVoting ? '처리 중...' : opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg p-3 text-center text-[12px] font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
          소중한 의견이 제출되었습니다. 감사합니다!
        </div>
      )}
    </div>
  );
}