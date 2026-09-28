import { HistoryList } from '../components/identification/HistoryList';

export default function PlantsScreen() {
  return (
    <HistoryList
      title="Mis Plantas"
      tipo="planta"
      emptyHint="Usá la cámara para identificar tu primera planta."
    />
  );
}
