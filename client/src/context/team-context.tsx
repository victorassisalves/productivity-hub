import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './auth-context';
import { Team, TeamMember } from '@shared/schema';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: TeamMember[];
  isLoading: boolean;
  setCurrentTeam: (team: Team) => void;
  createTeam: (name: string, description?: string) => Promise<Team | null>;
  updateTeam: (teamId: number, updates: Partial<Team>) => Promise<Team | null>;
  deleteTeam: (teamId: number) => Promise<boolean>;
  addTeamMember: (teamId: number, userId: number, role?: string) => Promise<TeamMember | null>;
  removeTeamMember: (memberId: number) => Promise<boolean>;
  updateTeamMemberRole: (memberId: number, role: string) => Promise<TeamMember | null>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load user's teams when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserTeams();
    } else {
      setTeams([]);
      setCurrentTeam(null);
      setTeamMembers([]);
    }
  }, [isAuthenticated, user]);

  // Load team members when current team changes
  useEffect(() => {
    if (currentTeam) {
      loadTeamMembers(currentTeam.id);
    } else {
      setTeamMembers([]);
    }
  }, [currentTeam]);

  const loadUserTeams = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userTeams = await apiRequest<Team[]>(`/api/users/${user.id}/teams`);
      setTeams(userTeams);
      
      // Set first team as current if no current team is selected
      if (userTeams.length > 0 && !currentTeam) {
        setCurrentTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Failed to load user teams', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTeamMembers = async (teamId: number) => {
    try {
      setIsLoading(true);
      const members = await apiRequest<TeamMember[]>(`/api/teams/${teamId}/members`);
      setTeamMembers(members);
    } catch (error) {
      console.error(`Failed to load team members for team ${teamId}`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTeam = async (name: string, description?: string): Promise<Team | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      const newTeam = await apiRequest<Team>('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          userId: user.id, // Pass the user ID to identify team creator
        }),
      });
      
      setTeams(prevTeams => [...prevTeams, newTeam]);
      return newTeam;
    } catch (error) {
      console.error('Failed to create team', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTeam = async (teamId: number, updates: Partial<Team>): Promise<Team | null> => {
    try {
      setIsLoading(true);
      const updatedTeam = await apiRequest<Team>(`/api/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      setTeams(prevTeams => 
        prevTeams.map(team => team.id === teamId ? updatedTeam : team)
      );
      
      if (currentTeam?.id === teamId) {
        setCurrentTeam(updatedTeam);
      }
      
      return updatedTeam;
    } catch (error) {
      console.error(`Failed to update team ${teamId}`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTeam = async (teamId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiRequest<{ success: boolean }>(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      
      if (currentTeam?.id === teamId) {
        setCurrentTeam(teams.length > 0 ? teams[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to delete team ${teamId}`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const addTeamMember = async (teamId: number, userId: number, role?: string): Promise<TeamMember | null> => {
    try {
      setIsLoading(true);
      const newMember = await apiRequest<TeamMember>(`/api/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      });
      
      if (currentTeam?.id === teamId) {
        setTeamMembers(prevMembers => [...prevMembers, newMember]);
      }
      
      return newMember;
    } catch (error) {
      console.error(`Failed to add member to team ${teamId}`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeTeamMember = async (memberId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiRequest<{ success: boolean }>(`/api/team-members/${memberId}`, {
        method: 'DELETE',
      });
      
      setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      return true;
    } catch (error) {
      console.error(`Failed to remove team member ${memberId}`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTeamMemberRole = async (memberId: number, role: string): Promise<TeamMember | null> => {
    try {
      setIsLoading(true);
      const updatedMember = await apiRequest<TeamMember>(`/api/team-members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      
      setTeamMembers(prevMembers => 
        prevMembers.map(member => member.id === memberId ? updatedMember : member)
      );
      
      return updatedMember;
    } catch (error) {
      console.error(`Failed to update role for team member ${memberId}`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value: TeamContextType = {
    teams,
    currentTeam,
    teamMembers,
    isLoading,
    setCurrentTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}