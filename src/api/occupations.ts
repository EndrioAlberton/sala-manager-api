export const occupationsApi = {
  getOccupiedRooms: async (date: Date, time: string) => {
    // Formata a data para YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    try {
      const response = await fetch(
        `${API_URL}/occupations/occupied?date=${formattedDate}&time=${time}`
      );
      if (!response.ok) throw new Error('Erro ao buscar salas ocupadas');
      return response.json();
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }
}; 