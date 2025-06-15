import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '../model/user.modal';

@Injectable()
export class ProfessorGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta') as any;
      
      // Permite acesso para admin e professor
      if (decoded.userType !== UserType.ADMIN && decoded.userType !== UserType.PROFESSOR) {
        throw new UnauthorizedException('Acesso permitido apenas para administradores e professores');
      }

      // Adiciona o usuário decodificado à requisição
      request.user = decoded;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
} 