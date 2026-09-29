import { HistoryList } from '../components/identification/HistoryList';

export default function UnknownScreen() {
  return (
    <HistoryList
      title="Sin identificar"
      tipo="desconocido"
      emptyTitle="No hay fotos sin identificar."
      emptyHint="Acá aparecen las fotos que no pudimos reconocer como planta ni animal."
    />
  );
}
