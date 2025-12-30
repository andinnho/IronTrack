import { ExerciseDefinition, WeekDayWorkout } from './types';

export const getImg = (text: string) => `https://placehold.co/200x200/1e293b/0ea5e9?text=${encodeURIComponent(text)}`;

export const INITIAL_EXERCISES: ExerciseDefinition[] = [
  // PEITO
  { id: 'b6274618-3a69-4db8-b99e-75507d35848b', name: 'Supino Reto', slug: 'supino-reto', target: 'chest', equipment: 'barra', imageUrl: getImg('Supino Reto') },
  { id: '064ad465-9dd8-45ac-b22e-2a3f01c49ed5', name: 'Supino Inclinado', slug: 'supino-inclinado', target: 'chest', equipment: 'barra', imageUrl: getImg('Supino Inclinado') },
  { id: '8a6a1300-7100-4a57-8b69-f3a96fa93918', name: 'Crucifixo com Halteres', slug: 'crucifixo-halteres', target: 'chest', equipment: 'halteres', imageUrl: getImg('Crucifixo Halteres') },
  { id: 'd28f90e4-6f86-48e9-875e-60d9dfa314a2', name: 'Flexão de Braços', slug: 'flexao-bracos', target: 'chest', equipment: 'peso corporal', imageUrl: getImg('Flexão') },
  
  // COSTAS
  { id: '775027c5-c66a-4333-886c-3af976129b7e', name: 'Puxada Frontal', slug: 'puxada-frontal', target: 'back', equipment: 'máquina', imageUrl: getImg('Puxada Frontal') },
  { id: '3bc103c7-7fc6-4885-8359-df6403683db4', name: 'Remada Curvada', slug: 'remada-curvada', target: 'back', equipment: 'barra', imageUrl: getImg('Remada Curvada') },
  { id: 'a83899de-f20b-4170-9ed0-966a2e8aef04', name: 'Remada Unilateral', slug: 'remada-unilateral', target: 'back', equipment: 'halter', imageUrl: getImg('Remada Unilateral') },
  
  // OMBRO
  { id: '0893fe2b-2c8d-4c81-8cb1-8ecb852ee968', name: 'Elevação Lateral', slug: 'elevacao-lateral', target: 'shoulders', equipment: 'halteres', imageUrl: getImg('Elev. Lateral') },
  { id: '01b35678-6d0d-4597-b56b-76fefe29d5ea', name: 'Elevação Frontal', slug: 'elevacao-frontal', target: 'shoulders', equipment: 'halteres', imageUrl: getImg('Elev. Frontal') },
  { id: '9925846c-15e6-40c4-8595-d8a13652b934', name: 'Desenvolvimento com Halteres', slug: 'desenvolvimento-halteres', target: 'shoulders', equipment: 'halteres', imageUrl: getImg('Desenv. Halteres') },
  
  // BRAÇOS
  { id: '34e2bbb9-e4f9-4142-9d93-697bc52e71c1', name: 'Rosca Direta', slug: 'rosca-direta', target: 'arms', equipment: 'barra', imageUrl: getImg('Rosca Direta') },
  { id: 'e61659ea-a630-4cdf-b1d4-454284f1a1c4', name: 'Rosca Alternada', slug: 'rosca-alternada', target: 'arms', equipment: 'halteres', imageUrl: getImg('Rosca Alt') },
  { id: 'cc0cbce9-cdb9-4525-aa40-da6586552f77', name: 'Tríceps Pulley', slug: 'triceps-pulley', target: 'arms', equipment: 'máquina', imageUrl: getImg('Tríceps Pulley') },
  { id: 'a2e79aa8-4e69-4f58-bde9-5a29d60c7db5', name: 'Tríceps Testa', slug: 'triceps-testa', target: 'arms', equipment: 'barra', imageUrl: getImg('Tríceps Testa') },
  
  // PERNAS
  { id: 'd4fa96c7-9d9c-4d9e-8acc-b70a5ab08bb7', name: 'Agachamento Livre', slug: 'agachamento-livre', target: 'legs', equipment: 'barra', imageUrl: getImg('Agachamento') },
  { id: '3a3c8e9e-cf2a-4bff-a421-fe629a0435e9', name: 'Leg Press', slug: 'leg-press', target: 'legs', equipment: 'máquina', imageUrl: getImg('Leg Press') },
  { id: '500e05f8-68b5-492e-a22d-d1945183e4f7', name: 'Panturrilha em Pé', slug: 'panturrilha-pe', target: 'legs', equipment: 'máquina', imageUrl: getImg('Panturrilha Pé') },
  
  // CORE
  { id: 'a28e9a96-31e4-44ea-b0b1-9cc2bc67873e', name: 'Abdominal Reto', slug: 'abdominal-reto', target: 'core', equipment: 'peso corporal', imageUrl: getImg('Abs Reto') },
  { id: '1e4e220d-13eb-4f1b-b6f9-d73e78d2773c', name: 'Prancha', slug: 'prancha', target: 'core', equipment: 'peso corporal', imageUrl: getImg('Prancha') },

  // CARDIO
  { id: '54bbb198-943b-48bf-8108-3a04841d80bc', name: 'Esteira – Caminhada', slug: 'esteira-caminhada', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Esteira Caminhada') },
  { id: 'caac99c3-f7d4-473f-b541-e9c69c40d2bf', name: 'Esteira – Corrida', slug: 'esteira-corrida', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Esteira Corrida') },
  { id: 'f48d9a22-1d12-4e92-a8c1-90a6f8b1c1e1', name: 'Esteira – Corrida Inclinada', slug: 'esteira-corrida-inclinada', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Corrida Inclinada') },
  { id: '406a165f-3554-44f8-9124-6bf6789c632f', name: 'Bicicleta Ergométrica Vertical', slug: 'bicicleta-vertical', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Bike Vertical') },
  { id: 'd1a2b3c4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', name: 'Bicicleta Ergométrica Horizontal', slug: 'bicicleta-horizontal', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Bike Horizontal') },
  { id: 'e9e1a03a-1c8d-4038-8e80-2a18f891cbd2', name: 'Elíptico', slug: 'eliptico', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Elíptico') },
  { id: 'b1a2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7', name: 'Escada (Stair Climber)', slug: 'escada', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Escada') },
  { id: 'c1a2b3d4-e5f6-4789-a0b1-c2d3e4f5a6b8', name: 'Remo Ergométrico', slug: 'remo-ergometrico', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Remo') },
  { id: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b9', name: 'Air Bike (Bike de ar)', slug: 'air-bike', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Air Bike') },
  { id: 'd1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6c0', name: 'Transport (Simulador de corrida)', slug: 'transport', target: 'cardio', equipment: 'máquina', imageUrl: getImg('Transport') },
];

export const INITIAL_WEEK_SCHEDULE: WeekDayWorkout[] = [
  { dayId: 'monday', dayName: 'Segunda', title: 'Peito e Tríceps', exercises: [] },
  { dayId: 'tuesday', dayName: 'Terça', title: 'Costas e Bíceps', exercises: [] },
  { dayId: 'wednesday', dayName: 'Quarta', title: 'Descanso / Cardio', exercises: [] },
  { dayId: 'thursday', dayName: 'Quinta', title: 'Pernas Completo', exercises: [] },
  { dayId: 'friday', dayName: 'Sexta', title: 'Ombros e Trapézio', exercises: [] },
  { dayId: 'saturday', dayName: 'Sábado', title: 'Core / Cardio', exercises: [] },
  { dayId: 'sunday', dayName: 'Domingo', title: 'Descanso Total', exercises: [] },
];

export const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Peito' },
  { id: 'back', label: 'Costas' },
  { id: 'legs', label: 'Pernas' },
  { id: 'shoulders', label: 'Ombros' },
  { id: 'arms', label: 'Braços' },
  { id: 'core', label: 'Abdômen/Core' },
  { id: 'cardio', label: 'Cardio' },
];