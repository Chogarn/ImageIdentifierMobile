import { HistoryList } from '../components/identification/HistoryList';

export default function AnimalsScreen() {
  return (
    <HistoryList
      title="Mis Animales"
      tipo="animal"
      emptyHint="Usá la cámara para identificar tu primer animal."
    />
  );
}
