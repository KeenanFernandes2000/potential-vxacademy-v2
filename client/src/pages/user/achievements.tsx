import React from "react";

const Achievements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Achievements</h1>
        <p className="text-muted-foreground">
          Celebrate your learning milestones and earned certificates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏆</span>
            </div>
            <div>
              <h3 className="font-semibold">First Course Complete</h3>
              <p className="text-sm text-muted-foreground">
                Completed your first course
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-semibold">Study Streak</h3>
              <p className="text-sm text-muted-foreground">7 days in a row</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">⭐</span>
            </div>
            <div>
              <h3 className="font-semibold">Perfect Score</h3>
              <p className="text-sm text-muted-foreground">
                100% on React Quiz
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎓</span>
            </div>
            <div>
              <h3 className="font-semibold">Certificate Earned</h3>
              <p className="text-sm text-muted-foreground">
                JavaScript Fundamentals
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🔥</span>
            </div>
            <div>
              <h3 className="font-semibold">Speed Learner</h3>
              <p className="text-sm text-muted-foreground">
                Completed course in 2 days
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">💎</span>
            </div>
            <div>
              <h3 className="font-semibold">Dedicated Learner</h3>
              <p className="text-sm text-muted-foreground">
                50 hours of study time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
