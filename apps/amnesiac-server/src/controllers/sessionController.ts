import { Request, Response } from 'express';
import { sessionService } from '../services/sessionService.js';
import { CreateSessionDto, UpdateSessionDto } from '../types/session.js';
import { ApiResponse } from '../types/api.js';

export class SessionController {
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionData: CreateSessionDto = req.body;

      if (!sessionData.name || !sessionData.type) {
        res.status(400).json({
          success: false,
          error: 'Name and type are required',
        } as ApiResponse);
        return;
      }

      const session = await sessionService.createSession(sessionData);

      res.status(201).json({
        success: true,
        data: session,
        message: 'Session created successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }

  async getSession(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await sessionService.getSession(id);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: session,
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }

  async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await sessionService.getAllSessions();

      res.json({
        success: true,
        data: sessions,
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }

  async updateSession(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateSessionDto = req.body;

      const session = await sessionService.updateSession(id, updateData);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: session,
        message: 'Session updated successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }

  async deleteSession(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await sessionService.deleteSession(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Session deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }

  async updateSessionState(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const state = req.body;

      const session = await sessionService.updateSessionState(id, state);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: session,
        message: 'Session state updated successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating session state:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      } as ApiResponse);
    }
  }
}

export const sessionController = new SessionController();
