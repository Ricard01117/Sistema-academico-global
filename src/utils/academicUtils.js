export const SEMESTRES =
  Array.from(
    {
      length: 12,
    },
    (_, index) =>
      index + 1,
  );


export function formatearNombreTabla(
  nombre = "",
) {
  const partes =
    nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (partes.length < 3) {
    return nombre.trim();
  }

  const apellidos =
    partes.slice(-2);

  const nombres =
    partes.slice(
      0,
      -2,
    );

  return [
    ...apellidos,
    ...nombres,
  ].join(" ");
}


export function numeroOrdinalSemestre(
  semestre,
) {
  return `Semestre ${semestre}`;
}