import {
  localGetMaterias,
  localGetMateriaCatalogos,
  localCreateMateria,
  localUpdateMateria,
  localUpdateMateriaEstado,
  localDeleteMateria,
  localSincronizarCalificaciones,
} from "./localAcademicService";

export const getMaterias = localGetMaterias;
export const getMateriaCatalogos = localGetMateriaCatalogos;
export const createMateria = localCreateMateria;
export const updateMateria = localUpdateMateria;
export const deleteMateria = localDeleteMateria;

export async function updateMateriaEstado(
  id,
  activa,
  carreraId = null,
  semestre = null,
) {
  const result = await localUpdateMateriaEstado(id, activa);

  if (activa && carreraId && semestre) {
    await localSincronizarCalificaciones(
      carreraId,
      semestre,
    );
  }

  return result;
}
