import { ExerciseDefinition, WeekDayWorkout } from './types';

// Helper for demo images since we don't have the real assets
const getImg = (text: string) => `https://placehold.co/200x200/1e293b/0ea5e9?text=${encodeURIComponent(text)}`;

export const INITIAL_EXERCISES: ExerciseDefinition[] = [
  // PEITO (CHEST)
  { id: 'ch_1', name: 'Supino Reto', slug: 'supino-reto', target: 'chest', targetMuscle: 'peitoral maior', equipment: 'barra', level: 'beginner', imageUrl: getImg('Supino Reto') },
  { id: 'ch_2', name: 'Supino Inclinado', slug: 'supino-inclinado', target: 'chest', targetMuscle: 'peitoral superior', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Supino Inclinado') },
  { id: 'ch_3', name: 'Supino com Halteres', slug: 'supino-halteres', target: 'chest', targetMuscle: 'peitoral', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Supino Halteres') },
  { id: 'ch_4', name: 'Crucifixo Reto', slug: 'crucifixo-reto', target: 'chest', targetMuscle: 'peitoral', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Crucifixo Reto') },
  { id: 'ch_5', name: 'Crucifixo Inclinado', slug: 'crucifixo-inclinado', target: 'chest', targetMuscle: 'peitoral superior', equipment: 'halteres', level: 'intermediate', imageUrl: getImg('Crucifixo Inc') },
  { id: 'ch_6', name: 'Peck Deck', slug: 'peck-deck', target: 'chest', targetMuscle: 'peitoral', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Peck Deck') },
  { id: 'ch_7', name: 'Flexão de Braço', slug: 'flexao-braco', target: 'chest', targetMuscle: 'peitoral', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Flexão') },

  // COSTAS (BACK)
  { id: 'bk_1', name: 'Puxada Frente', slug: 'puxada-frente', target: 'back', targetMuscle: 'latíssimo do dorso', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Puxada Frente') },
  { id: 'bk_2', name: 'Barra Fixa', slug: 'barra-fixa', target: 'back', targetMuscle: 'dorsais', equipment: 'peso corporal', level: 'intermediate', imageUrl: getImg('Barra Fixa') },
  { id: 'bk_3', name: 'Remada Curvada', slug: 'remada-curvada', target: 'back', targetMuscle: 'dorsais', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Remada Curvada') },
  { id: 'bk_4', name: 'Remada Unilateral', slug: 'remada-unilateral', target: 'back', targetMuscle: 'dorsais', equipment: 'halter', level: 'beginner', imageUrl: getImg('Remada Unilateral') },
  { id: 'bk_5', name: 'Remada Baixa', slug: 'remada-baixa', target: 'back', targetMuscle: 'dorsais', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Remada Baixa') },
  { id: 'bk_6', name: 'Pulldown', slug: 'pulldown', target: 'back', targetMuscle: 'dorsais', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Pulldown') },

  // OMBROS (SHOULDERS)
  { id: 'sh_1', name: 'Desenvolvimento com Barra', slug: 'desenvolvimento-barra', target: 'shoulders', targetMuscle: 'deltoide anterior', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Desenv. Barra') },
  { id: 'sh_2', name: 'Desenvolvimento com Halteres', slug: 'desenvolvimento-halteres', target: 'shoulders', targetMuscle: 'deltoides', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Desenv. Halteres') },
  { id: 'sh_3', name: 'Elevação Lateral', slug: 'elevacao-lateral', target: 'shoulders', targetMuscle: 'deltoide lateral', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Elev. Lateral') },
  { id: 'sh_4', name: 'Elevação Frontal', slug: 'elevacao-frontal', target: 'shoulders', targetMuscle: 'deltoide anterior', equipment: 'barra', level: 'beginner', imageUrl: getImg('Elev. Frontal') },
  { id: 'sh_5', name: 'Elevação Posterior', slug: 'elevacao-posterior', target: 'shoulders', targetMuscle: 'deltoide posterior', equipment: 'halteres', level: 'intermediate', imageUrl: getImg('Elev. Posterior') },
  { id: 'sh_6', name: 'Encolhimento', slug: 'encolhimento', target: 'shoulders', targetMuscle: 'trapézio', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Encolhimento') },

  // BRAÇOS (ARMS)
  { id: 'ar_1', name: 'Rosca Direta', slug: 'rosca-direta', target: 'arms', targetMuscle: 'bíceps', equipment: 'barra', level: 'beginner', imageUrl: getImg('Rosca Direta') },
  { id: 'ar_2', name: 'Rosca Alternada', slug: 'rosca-alternada', target: 'arms', targetMuscle: 'bíceps', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Rosca Alt') },
  { id: 'ar_3', name: 'Rosca Martelo', slug: 'rosca-martelo', target: 'arms', targetMuscle: 'braquial', equipment: 'halteres', level: 'beginner', imageUrl: getImg('Rosca Martelo') },
  { id: 'ar_4', name: 'Rosca Concentrada', slug: 'rosca-concentrada', target: 'arms', targetMuscle: 'bíceps', equipment: 'halter', level: 'intermediate', imageUrl: getImg('Rosca Conc') },
  { id: 'ar_5', name: 'Rosca Scott', slug: 'rosca-scott', target: 'arms', targetMuscle: 'bíceps', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Rosca Scott') },
  { id: 'ar_6', name: 'Tríceps Testa', slug: 'triceps-testa', target: 'arms', targetMuscle: 'tríceps', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Tríceps Testa') },
  { id: 'ar_7', name: 'Tríceps Corda', slug: 'triceps-corda', target: 'arms', targetMuscle: 'tríceps', equipment: 'polia', level: 'beginner', imageUrl: getImg('Tríceps Corda') },
  { id: 'ar_8', name: 'Tríceps Mergulho', slug: 'triceps-mergulho', target: 'arms', targetMuscle: 'tríceps', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Mergulho') },
  { id: 'ar_9', name: 'Tríceps Francês', slug: 'triceps-frances', target: 'arms', targetMuscle: 'tríceps', equipment: 'halter', level: 'beginner', imageUrl: getImg('Tríceps Francês') },

  // PERNAS (LEGS)
  { id: 'lg_1', name: 'Agachamento Livre', slug: 'agachamento-livre', target: 'legs', targetMuscle: 'quadríceps', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Agachamento') },
  { id: 'lg_2', name: 'Leg Press', slug: 'leg-press', target: 'legs', targetMuscle: 'quadríceps', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Leg Press') },
  { id: 'lg_3', name: 'Cadeira Extensora', slug: 'cadeira-extensora', target: 'legs', targetMuscle: 'quadríceps', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Extensora') },
  { id: 'lg_4', name: 'Mesa Flexora', slug: 'mesa-flexora', target: 'legs', targetMuscle: 'posteriores', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Flexora') },
  { id: 'lg_5', name: 'Stiff', slug: 'stiff', target: 'legs', targetMuscle: 'posteriores', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Stiff') },
  { id: 'lg_6', name: 'Panturrilha em Pé', slug: 'panturrilha-em-pe', target: 'legs', targetMuscle: 'panturrilhas', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Panturrilha Pé') },
  { id: 'lg_7', name: 'Panturrilha Sentado', slug: 'panturrilha-sentado', target: 'legs', targetMuscle: 'panturrilhas', equipment: 'máquina', level: 'beginner', imageUrl: getImg('Panturrilha Sent') },

  // ABDÔMEN (CORE)
  { id: 'cr_1', name: 'Abdominal Reto', slug: 'abdominal-reto', target: 'core', targetMuscle: 'abdômen', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Abs Reto') },
  { id: 'cr_2', name: 'Abdominal Infra', slug: 'abdominal-infra', target: 'core', targetMuscle: 'abdômen inferior', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Abs Infra') },
  { id: 'cr_3', name: 'Prancha', slug: 'prancha', target: 'core', targetMuscle: 'core', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Prancha') },
  { id: 'cr_4', name: 'Elevação de Pernas', slug: 'elevacao-pernas', target: 'core', targetMuscle: 'abdômen inferior', equipment: 'barra', level: 'intermediate', imageUrl: getImg('Elev Pernas') },
  { id: 'cr_5', name: 'Abdominal Oblíquo', slug: 'abdominal-obliquo', target: 'core', targetMuscle: 'oblíquos', equipment: 'peso corporal', level: 'beginner', imageUrl: getImg('Abs Oblíquo') },
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