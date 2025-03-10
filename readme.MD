# 🏫 Gerenciamento de Salas de Aula

Sistema para controle e organização de salas de aula.

## ✨ Funcionalidades

### 📝 Salas
- Criar nova sala
- Editar informações e excluir sala (quando não ocupada)
- Listar todas as salas

### 📋 Dados Controlados
- Número da sala
- Andar
- Prédio
- Mesas e cadeiras
- Computadores
- Projetor
- Capacidade de alunos
- Status de ocupação
- Professor e disciplina atual

## 🛠️ Tecnologias Backend

### Principal
- NestJS (Framework Node.js)
- TypeScript
- MySQL
- TypeORM (ORM)

### 📚 Documentação API (Swagger)
- Acesse: http://localhost:3000/api
- Teste todas as rotas
- Visualize os modelos de dados
- Execute requisições direto na interface

## ⚙️ Como Usar

### Banco de Dados
```sql
CREATE DATABASE eng3;
```

### Configuração
- Database: eng3
- Usuario: root
- Senha: em branco

### 🔗 Endpoints API

Criar sala (POST /classrooms):
```json
{
  "roomNumber": "A101",
  "floor": 1,
  "building": "Bloco A",
  "desks": 30,
  "chairs": 30,
  "hasProjector": true,
  "maxStudents": 40
}
```

Editar sala (PUT /classrooms/:id):
```json
{
  "hasProjector": false,
  "maxStudents": 35
}
```

Listar salas: GET /classrooms
Remover sala: DELETE /classrooms/:id

### 🚨 Validações
- Número da sala: max 10 caracteres
- Prédio: max 50 caracteres
- Andar: 0 a 20
- Mesas/Cadeiras: 0 a 100
- Alunos: 1 a 100