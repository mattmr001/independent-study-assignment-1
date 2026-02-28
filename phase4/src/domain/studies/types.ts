// ABOUTME: Study domain types — runtime container for a co-design study
// ABOUTME: References a Protocol and accumulates participants/sessions

export interface Study {
  id: string;
  name: string;
  protocolId: string;
  createdAt: string;
}
