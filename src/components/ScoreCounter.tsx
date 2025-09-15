import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Trophy, Users, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  score: number;
}

const ScoreCounter = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [advanceCount, setAdvanceCount] = useState(2);

  const addTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }
    
    if (teams.some(team => team.name.toLowerCase() === newTeamName.toLowerCase())) {
      toast.error("Team name already exists");
      return;
    }

    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamName.trim(),
      score: 0,
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    toast.success(`Team "${newTeam.name}" added`);
  };

  const updateScore = (teamId: string, increment: number) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, score: Math.max(0, team.score + increment) }
        : team
    ));
  };

  const removeTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    setTeams(teams.filter(team => team.id !== teamId));
    toast.success(`Team "${team?.name}" removed`);
  };

  const advanceToNextRound = () => {
    if (teams.length === 0) {
      toast.error("No teams to advance");
      return;
    }

    if (advanceCount > teams.length) {
      toast.error(`Cannot advance ${advanceCount} teams when only ${teams.length} teams exist`);
      return;
    }

    // Sort teams by score (highest first) to determine who advances
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const advancingTeams = sortedTeams.slice(0, advanceCount);
    
    // Reset scores for advancing teams
    const resetTeams = advancingTeams.map(team => ({ ...team, score: 0 }));
    
    setTeams(resetTeams);
    setCurrentRound(currentRound + 1);
    
    toast.success(`Round ${currentRound} complete! ${advanceCount} teams advance to Round ${currentRound + 1}`);
  };

  const resetTournament = () => {
    setTeams([]);
    setCurrentRound(1);
    toast.success("Tournament reset");
  };

  // Helper function to get team ranking without changing display order
  const getTeamRank = (teamId: string) => {
    const sortedByScore = [...teams].sort((a, b) => b.score - a.score);
    return sortedByScore.findIndex(team => team.id === teamId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-neon-green glow-green">
            AMPS
          </h1>
          <p className="text-muted-foreground">Round {currentRound}</p>
        </div>

        {/* Controls */}
        <Card className="p-6 bg-dark-surface border-border">
          <div className="space-y-4">
            {/* Add Team */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter team name..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                className="flex-1 bg-darker-surface border-border"
              />
              <Button onClick={addTeam} variant="default" className="glow-green">
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </div>

            {/* Round Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-blue" />
                <span className="text-sm">Advance top</span>
                <Input
                  type="number"
                  min="1"
                  max={teams.length}
                  value={advanceCount}
                  onChange={(e) => setAdvanceCount(parseInt(e.target.value) || 1)}
                  className="w-20 bg-darker-surface border-border text-center"
                />
                <span className="text-sm">teams</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={advanceToNextRound}
                  disabled={teams.length === 0}
                  variant="secondary"
                  className="glow-blue"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Next Round
                </Button>
                <Button 
                  onClick={resetTournament}
                  variant="destructive"
                  className="opacity-75 hover:opacity-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card className="p-12 text-center bg-dark-surface border-border">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Teams Added</h3>
            <p className="text-muted-foreground">Add some teams to start tracking scores</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map((team) => {
              const rank = getTeamRank(team.id);
              const isAdvancing = rank < advanceCount;
              
              return (
                <Card 
                  key={team.id} 
                  className={`p-6 bg-dark-surface border-border relative ${
                    isAdvancing ? 'ring-2 ring-neon-green glow-green' : ''
                  }`}
                >
                  {isAdvancing && (
                    <div className="absolute -top-2 -right-2 bg-neon-green text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {rank + 1}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate text-foreground text-lg">{team.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeam(team.id)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-neon-blue mb-2">{team.score}</div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateScore(team.id, -1)}
                          className="w-8 h-8 p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateScore(team.id, 1)}
                          className="w-8 h-8 p-0 border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {teams.length > 0 && (
          <Card className="p-4 bg-dark-surface border-border">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total Teams: {teams.length}</span>
              <span>Advancing: {Math.min(advanceCount, teams.length)}</span>
              <span>Round: {currentRound}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScoreCounter;