import { useOutletContext } from 'react-router-dom'
import type { useTasks } from './useTasks'
export function useFamilyTasks() { return useOutletContext<{ tasks: ReturnType<typeof useTasks> }>().tasks }
