import {
  getAcademicDatabase,
  saveAcademicDatabase,
  notifyDatabaseUpdated,
} from "../data/localStorageDatabase";


const SEMESTRES = Array.from(
  { length: 12 },
  (_, index) => index + 1,
);


const USERS_KEY =
  "academic-global-users";


const DEMO_USERS = [
  {
    id: 1,
    nombre: "Administrador Principal",
    correo: "admin@academico.com",
    password: "Admin123!",
    rol: "administrador",
    activo: true,
    demo: true,
  },
  {
    id: 2,
    nombre: "Profesor Demo",
    correo: "profesor@academico.com",
    password: "Profesor123!",
    rol: "maestro",
    activo: true,
    demo: true,
  },
];


function clone(value) {
  return JSON.parse(
    JSON.stringify(value),
  );
}


function isActive(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}


function now() {
  return new Date().toISOString();
}


function nextId(
  database,
  table,
) {
  const rows =
    database[table] || [];

  if (!rows.length) {
    return 1;
  }

  return (
    Math.max(
      ...rows.map(
        (row) =>
          Number(row.id) || 0,
      ),
    ) + 1
  );
}


function save(
  database,
  table = "all",
) {
  saveAcademicDatabase(
    database,
  );

  notifyDatabaseUpdated(
    table,
  );

  return database;
}


function average(values) {
  const numbers =
    values
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .map(Number)
      .filter(
        (value) =>
          Number.isFinite(value),
      );

  if (!numbers.length) {
    return null;
  }

  return Number(
    (
      numbers.reduce(
        (total, value) =>
          total + value,
        0,
      ) / numbers.length
    ).toFixed(2),
  );
}


function getActivePeriod(
  database,
) {
  return (
    database.periodos.find(
      (periodo) =>
        isActive(
          periodo.activo,
        ),
    ) ||
    database.periodos[0] ||
    null
  );
}


function getCarrera(
  database,
  id,
) {
  return (
    database.carreras.find(
      (item) =>
        Number(item.id) ===
        Number(id),
    ) || null
  );
}


function getGrupo(
  database,
  id,
) {
  return (
    database.grupos.find(
      (item) =>
        Number(item.id) ===
        Number(id),
    ) || null
  );
}


function getPeriodo(
  database,
  id,
) {
  return (
    database.periodos.find(
      (item) =>
        Number(item.id) ===
        Number(id),
    ) || null
  );
}


function getAlumno(
  database,
  id,
) {
  return (
    database.alumnos.find(
      (item) =>
        Number(item.id) ===
        Number(id),
    ) || null
  );
}


function currentEnrollment(
  database,
  alumnoId,
) {
  return (
    database.inscripciones.find(
      (item) =>
        Number(
          item.alumno_id,
        ) ===
          Number(
            alumnoId,
          ) &&
        isActive(
          item.activa,
        ),
    ) || null
  );
}


function formatSurnameFirst(
  nombre = "",
) {
  const parts =
    nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length < 3
  ) {
    return nombre;
  }

  const apellidos =
    parts.slice(-2);

  const nombres =
    parts.slice(
      0,
      -2,
    );

  return [
    ...apellidos,
    ...nombres,
  ].join(" ");
}


function enrichAlumno(
  database,
  alumno,
) {
  const inscripcion =
    currentEnrollment(
      database,
      alumno.id,
    );

  const carrera =
    inscripcion
      ? getCarrera(
          database,
          inscripcion.carrera_id,
        )
      : null;

  const grupo =
    inscripcion
      ? getGrupo(
          database,
          inscripcion.grupo_id,
        )
      : null;

  const periodo =
    inscripcion
      ? getPeriodo(
          database,
          inscripcion.periodo_id,
        )
      : null;

  return {
    ...clone(alumno),

    carrera_id:
      inscripcion?.carrera_id ??
      null,

    carrera_nombre:
      carrera?.nombre ??
      null,

    carrera:
      carrera?.nombre ??
      null,

    carrera_clave:
      carrera?.clave ??
      null,

    semestre:
      inscripcion?.semestre ??
      null,

    grupo_id:
      inscripcion?.grupo_id ??
      null,

    grupo_nombre:
      grupo?.nombre ??
      null,

    grupo:
      grupo?.nombre ??
      null,

    periodo_id:
      inscripcion?.periodo_id ??
      null,

    periodo_nombre:
      periodo?.nombre ??
      null,

    inscripcion_id:
      inscripcion?.id ??
      null,

    nombre_tabla:
      formatSurnameFirst(
        alumno.nombre,
      ),
  };
}


function resolveGroup(
  database,
  carreraId,
  semestre,
  grupoId = null,
) {
  if (grupoId) {
    const selected =
      database.grupos.find(
        (grupo) =>
          Number(grupo.id) ===
            Number(grupoId) &&
          Number(
            grupo.carrera_id,
          ) ===
            Number(carreraId) &&
          Number(
            grupo.semestre,
          ) ===
            Number(semestre),
      );

    if (selected) {
      return selected;
    }
  }

  let group =
    database.grupos.find(
      (item) =>
        Number(
          item.carrera_id,
        ) ===
          Number(carreraId) &&
        Number(
          item.semestre,
        ) ===
          Number(semestre) &&
        isActive(
          item.activo,
        ) &&
        (
          item.letra === "A" ||
          !item.letra
        ),
    );

  if (group) {
    return group;
  }

  const carrera =
    getCarrera(
      database,
      carreraId,
    );

  const periodo =
    getActivePeriod(
      database,
    );

  if (!carrera) {
    throw new Error(
      "La carrera seleccionada no existe.",
    );
  }

  if (!periodo) {
    throw new Error(
      "No existe un periodo académico activo.",
    );
  }

  group = {
    id:
      nextId(
        database,
        "grupos",
      ),

    carrera_id:
      Number(
        carreraId,
      ),

    semestre:
      Number(
        semestre,
      ),

    letra:
      "A",

    nombre:
      `${carrera.clave}-${semestre}A`,

    periodo_id:
      periodo.id,

    maestro_id:
      null,

    activo:
      true,
  };

  database.grupos.push(
    group,
  );

  return group;
}


function syncGradesInDatabase(
  database,
  carreraId,
  semestre,
) {
  const materias =
    database.materias.filter(
      (materia) =>
        Number(
          materia.carrera_id,
        ) ===
          Number(carreraId) &&
        Number(
          materia.semestre,
        ) ===
          Number(semestre) &&
        isActive(
          materia.activa,
        ),
    );

  const inscripciones =
    database.inscripciones.filter(
      (inscripcion) =>
        Number(
          inscripcion.carrera_id,
        ) ===
          Number(carreraId) &&
        Number(
          inscripcion.semestre,
        ) ===
          Number(semestre) &&
        isActive(
          inscripcion.activa,
        ),
    );

  for (
    const inscripcion
    of inscripciones
  ) {
    const alumno =
      getAlumno(
        database,
        inscripcion.alumno_id,
      );

    if (
      !alumno ||
      alumno.estado !== "activo"
    ) {
      continue;
    }

    for (
      const materia
      of materias
    ) {
      const exists =
        database.calificaciones.some(
          (calificacion) =>
            Number(
              calificacion.inscripcion_id,
            ) ===
              Number(
                inscripcion.id,
              ) &&
            Number(
              calificacion.materia_id,
            ) ===
              Number(
                materia.id,
              ),
        );

      if (!exists) {
        database.calificaciones.push({
          id:
            nextId(
              database,
              "calificaciones",
            ),

          inscripcion_id:
            inscripcion.id,

          materia_id:
            materia.id,

          parcial_1:
            null,

          parcial_2:
            null,

          parcial_3:
            null,

          promedio:
            null,

          estado:
            "pendiente",
        });
      }
    }
  }
}


// ============================================================
// CARRERAS
// ============================================================

export async function localGetCarreras(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  let rows =
    database.carreras.map(
      clone,
    );

  if (filters.search) {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    rows =
      rows.filter(
        (row) =>
          row.nombre
            ?.toLowerCase()
            .includes(search) ||
          row.clave
            ?.toLowerCase()
            .includes(search),
      );
  }

  if (
    filters.activa !== "" &&
    filters.activa !==
      undefined &&
    filters.activa !==
      null
  ) {
    const wanted =
      isActive(
        filters.activa,
      );

    rows =
      rows.filter(
        (row) =>
          isActive(
            row.activa,
          ) === wanted,
      );
  }

  return rows.sort(
    (a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        "es",
      ),
  );
}


export async function localGetSemestres() {
  return clone(
    SEMESTRES,
  );
}


export async function localCreateCarrera(
  carrera,
) {
  const database =
    getAcademicDatabase();

  const clave =
    String(
      carrera.clave || "",
    )
      .trim()
      .toUpperCase();

  if (
    database.carreras.some(
      (item) =>
        String(
          item.clave,
        ).toUpperCase() ===
        clave,
    )
  ) {
    throw new Error(
      "Ya existe una carrera con esa clave.",
    );
  }

  const row = {
    id:
      nextId(
        database,
        "carreras",
      ),

    nombre:
      carrera.nombre?.trim(),

    clave,

    activa:
      carrera.activa ??
      true,

    created_at:
      now(),

    updated_at:
      now(),
  };

  database.carreras.push(
    row,
  );

  save(
    database,
    "carreras",
  );

  return clone(row);
}


export async function localUpdateCarrera(
  id,
  carrera,
) {
  const database =
    getAcademicDatabase();

  const index =
    database.carreras.findIndex(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (index === -1) {
    throw new Error(
      "La carrera no existe.",
    );
  }

  database.carreras[index] = {
    ...database.carreras[
      index
    ],

    ...clone(carrera),

    id:
      database.carreras[
        index
      ].id,

    updated_at:
      now(),
  };

  save(
    database,
    "carreras",
  );

  return clone(
    database.carreras[
      index
    ],
  );
}


export async function localUpdateCarreraEstado(
  id,
  activa,
) {
  return localUpdateCarrera(
    id,
    {
      activa,
    },
  );
}


export async function localDeleteCarrera(
  id,
) {
  const database =
    getAcademicDatabase();

  const hasData =
    database.materias.some(
      (item) =>
        Number(
          item.carrera_id,
        ) === Number(id),
    ) ||
    database.inscripciones.some(
      (item) =>
        Number(
          item.carrera_id,
        ) === Number(id),
    );

  if (hasData) {
    throw new Error(
      "No se puede eliminar una carrera que tiene materias o alumnos relacionados.",
    );
  }

  database.carreras =
    database.carreras.filter(
      (item) =>
        Number(item.id) !==
        Number(id),
    );

  save(
    database,
    "carreras",
  );

  return {
    ok: true,
  };
}


// ============================================================
// MATERIAS
// ============================================================

export async function localGetMaterias(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  let rows =
    database.materias.map(
      (materia) => {
        const carrera =
          getCarrera(
            database,
            materia.carrera_id,
          );

        return {
          ...clone(materia),

          carrera:
            carrera?.nombre ??
            "",

          carrera_nombre:
            carrera?.nombre ??
            "",

          carrera_clave:
            carrera?.clave ??
            "",
        };
      },
    );

  if (filters.search) {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    rows =
      rows.filter(
        (item) =>
          item.nombre
            ?.toLowerCase()
            .includes(search) ||
          item.clave
            ?.toLowerCase()
            .includes(search),
      );
  }

  if (filters.carrera_id) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(
            filters.carrera_id,
          ),
      );
  }

  if (filters.semestre) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(
            filters.semestre,
          ),
      );
  }

  if (
    filters.activa !== "" &&
    filters.activa !==
      undefined &&
    filters.activa !==
      null
  ) {
    const wanted =
      isActive(
        filters.activa,
      );

    rows =
      rows.filter(
        (item) =>
          isActive(
            item.activa,
          ) === wanted,
      );
  }

  return rows.sort(
    (a, b) =>
      Number(a.semestre) -
        Number(b.semestre) ||
      a.nombre.localeCompare(
        b.nombre,
        "es",
      ),
  );
}


export async function localGetMateriaCatalogos() {
  const database =
    getAcademicDatabase();

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    semestres:
      clone(
        SEMESTRES,
      ),
  };
}


export async function localCreateMateria(
  materia,
) {
  const database =
    getAcademicDatabase();

  const clave =
    String(
      materia.clave || "",
    )
      .trim()
      .toUpperCase();

  if (
    database.materias.some(
      (item) =>
        String(
          item.clave,
        ).toUpperCase() ===
        clave,
    )
  ) {
    throw new Error(
      "Ya existe una materia con esa clave.",
    );
  }

  const row = {
    id:
      nextId(
        database,
        "materias",
      ),

    carrera_id:
      Number(
        materia.carrera_id,
      ),

    semestre:
      Number(
        materia.semestre,
      ),

    clave,

    nombre:
      materia.nombre?.trim(),

    creditos:
      Number(
        materia.creditos ?? 5,
      ),

    activa:
      materia.activa ??
      true,
  };

  database.materias.push(
    row,
  );

  if (
    isActive(
      row.activa,
    )
  ) {
    syncGradesInDatabase(
      database,
      row.carrera_id,
      row.semestre,
    );
  }

  save(
    database,
    "materias",
  );

  return clone(row);
}


export async function localUpdateMateria(
  id,
  materia,
) {
  const database =
    getAcademicDatabase();

  const index =
    database.materias.findIndex(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (index === -1) {
    throw new Error(
      "La materia no existe.",
    );
  }

  database.materias[index] = {
    ...database.materias[
      index
    ],

    ...clone(materia),

    carrera_id:
      Number(
        materia.carrera_id ??
        database.materias[
          index
        ].carrera_id,
      ),

    semestre:
      Number(
        materia.semestre ??
        database.materias[
          index
        ].semestre,
      ),

    id:
      database.materias[
        index
      ].id,
  };

  const updated =
    database.materias[
      index
    ];

  if (
    isActive(
      updated.activa,
    )
  ) {
    syncGradesInDatabase(
      database,
      updated.carrera_id,
      updated.semestre,
    );
  }

  save(
    database,
    "materias",
  );

  return clone(updated);
}


export async function localUpdateMateriaEstado(
  id,
  activa,
) {
  const database =
    getAcademicDatabase();

  const materia =
    database.materias.find(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (!materia) {
    throw new Error(
      "La materia no existe.",
    );
  }

  materia.activa =
    activa;

  if (isActive(activa)) {
    syncGradesInDatabase(
      database,
      materia.carrera_id,
      materia.semestre,
    );
  }

  save(
    database,
    "materias",
  );

  return clone(materia);
}


export async function localDeleteMateria(
  id,
) {
  const database =
    getAcademicDatabase();

  database.calificaciones =
    database.calificaciones.filter(
      (item) =>
        Number(
          item.materia_id,
        ) !== Number(id),
    );

  database.materias =
    database.materias.filter(
      (item) =>
        Number(item.id) !==
        Number(id),
    );

  save(
    database,
    "materias",
  );

  return {
    ok: true,
  };
}


// ============================================================
// ALUMNOS
// ============================================================

export async function localGetAlumnos(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  let rows =
    database.alumnos.map(
      (alumno) =>
        enrichAlumno(
          database,
          alumno,
        ),
    );

  if (filters.search) {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    rows =
      rows.filter(
        (item) =>
          item.nombre
            ?.toLowerCase()
            .includes(search) ||
          item.matricula
            ?.toLowerCase()
            .includes(search) ||
          item.correo
            ?.toLowerCase()
            .includes(search),
      );
  }

  if (filters.carrera_id) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(
            filters.carrera_id,
          ),
      );
  }

  if (filters.semestre) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(
            filters.semestre,
          ),
      );
  }

  if (filters.grupo_id) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.grupo_id,
          ) ===
          Number(
            filters.grupo_id,
          ),
      );
  }

  if (filters.estado) {
    rows =
      rows.filter(
        (item) =>
          item.estado ===
          filters.estado,
      );
  }

  return rows.sort(
    (a, b) =>
      a.nombre_tabla.localeCompare(
        b.nombre_tabla,
        "es",
      ),
  );
}


export async function localGetAlumnoCatalogos(
  carreraId = "",
  semestre = "",
) {
  const database =
    getAcademicDatabase();

  let grupos =
    database.grupos.filter(
      (item) =>
        isActive(
          item.activo,
        ),
    );

  if (carreraId) {
    grupos =
      grupos.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(carreraId),
      );
  }

  if (semestre) {
    grupos =
      grupos.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(semestre),
      );
  }

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    semestres:
      clone(
        SEMESTRES,
      ),

    grupos:
      grupos.map(clone),

    periodos:
      database.periodos.map(
        clone,
      ),

    estados: [
      "activo",
      "baja",
      "egresado",
    ],
  };
}


export async function localCreateAlumno(
  alumno,
) {
  const database =
    getAcademicDatabase();

  const id =
    nextId(
      database,
      "alumnos",
    );

  const matricula =
    alumno.matricula ||
    `${new Date().getFullYear()}${String(
      id,
    ).padStart(4, "0")}`;

  if (
    database.alumnos.some(
      (item) =>
        item.correo &&
        alumno.correo &&
        item.correo.toLowerCase() ===
          alumno.correo.toLowerCase(),
    )
  ) {
    throw new Error(
      "Ya existe un alumno con ese correo.",
    );
  }

  const row = {
    id,

    matricula,

    nombre:
      alumno.nombre?.trim(),

    correo:
      alumno.correo?.trim() ||
      null,

    estado:
      alumno.estado ||
      "activo",
  };

  database.alumnos.push(
    row,
  );

  const group =
    resolveGroup(
      database,
      alumno.carrera_id,
      alumno.semestre,
      alumno.grupo_id,
    );

  const periodo =
    getActivePeriod(
      database,
    );

  const inscripcion = {
    id:
      nextId(
        database,
        "inscripciones",
      ),

    alumno_id:
      id,

    carrera_id:
      Number(
        alumno.carrera_id,
      ),

    semestre:
      Number(
        alumno.semestre,
      ),

    grupo_id:
      group.id,

    periodo_id:
      periodo.id,

    activa:
      true,

    fecha_inicio:
      now(),

    fecha_fin:
      null,

    motivo_cambio:
      "Registro inicial",
  };

  database.inscripciones.push(
    inscripcion,
  );

  syncGradesInDatabase(
    database,
    inscripcion.carrera_id,
    inscripcion.semestre,
  );

  save(
    database,
    "alumnos",
  );

  return enrichAlumno(
    database,
    row,
  );
}


export async function localUpdateAlumno(
  id,
  alumno,
) {
  const database =
    getAcademicDatabase();

  const index =
    database.alumnos.findIndex(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (index === -1) {
    throw new Error(
      "El alumno no existe.",
    );
  }

  database.alumnos[index] = {
    ...database.alumnos[
      index
    ],

    ...clone(alumno),

    id:
      database.alumnos[
        index
      ].id,
  };

  save(
    database,
    "alumnos",
  );

  return enrichAlumno(
    database,
    database.alumnos[
      index
    ],
  );
}


export async function localUpdateAlumnoAsignacion(
  id,
  asignacion,
) {
  const database =
    getAcademicDatabase();

  const alumno =
    getAlumno(
      database,
      id,
    );

  if (!alumno) {
    throw new Error(
      "El alumno no existe.",
    );
  }

  const previous =
    currentEnrollment(
      database,
      id,
    );

  const previousGrades =
    previous
      ? database.calificaciones.filter(
          (item) =>
            Number(
              item.inscripcion_id,
            ) ===
            Number(
              previous.id,
            ),
        )
      : [];

  if (previous) {
    previous.activa =
      false;

    previous.fecha_fin =
      now();

    previous.motivo_cambio =
      asignacion.motivo_cambio ||
      "Cambio de asignación";
  }

  const carreraId =
    Number(
      asignacion.carrera_id,
    );

  const semestre =
    Number(
      asignacion.semestre,
    );

  const group =
    resolveGroup(
      database,
      carreraId,
      semestre,
      asignacion.grupo_id,
    );

  const periodo =
    getActivePeriod(
      database,
    );

  const newEnrollment = {
    id:
      nextId(
        database,
        "inscripciones",
      ),

    alumno_id:
      Number(id),

    carrera_id:
      carreraId,

    semestre,

    grupo_id:
      group.id,

    periodo_id:
      periodo.id,

    activa:
      true,

    fecha_inicio:
      now(),

    fecha_fin:
      null,

    motivo_cambio:
      asignacion.motivo_cambio ||
      "Cambio de asignación",
  };

  database.inscripciones.push(
    newEnrollment,
  );

  const materias =
    database.materias.filter(
      (materia) =>
        Number(
          materia.carrera_id,
        ) ===
          carreraId &&
        Number(
          materia.semestre,
        ) ===
          semestre &&
        isActive(
          materia.activa,
        ),
    );

  for (
    const materia
    of materias
  ) {
    const oldGrade =
      previousGrades.find(
        (grade) =>
          Number(
            grade.materia_id,
          ) ===
          Number(
            materia.id,
          ),
      );

    database.calificaciones.push({
      id:
        nextId(
          database,
          "calificaciones",
        ),

      inscripcion_id:
        newEnrollment.id,

      materia_id:
        materia.id,

      parcial_1:
        null,

      parcial_2:
        null,

      parcial_3:
        null,

      promedio:
        oldGrade?.promedio ??
        null,

      estado:
        oldGrade?.estado ??
        "pendiente",
    });
  }

  save(
    database,
    "inscripciones",
  );

  return enrichAlumno(
    database,
    alumno,
  );
}


export async function localGetAlumnoHistorial(
  id,
) {
  const database =
    getAcademicDatabase();

  return database.inscripciones
    .filter(
      (item) =>
        Number(
          item.alumno_id,
        ) === Number(id),
    )
    .map(
      (item) => {
        const carrera =
          getCarrera(
            database,
            item.carrera_id,
          );

        const grupo =
          getGrupo(
            database,
            item.grupo_id,
          );

        const periodo =
          getPeriodo(
            database,
            item.periodo_id,
          );

        return {
          ...clone(item),

          carrera:
            carrera?.nombre ??
            "",

          carrera_nombre:
            carrera?.nombre ??
            "",

          carrera_clave:
            carrera?.clave ??
            "",

          grupo:
            grupo?.nombre ??
            "",

          grupo_nombre:
            grupo?.nombre ??
            "",

          periodo:
            periodo?.nombre ??
            "",

          periodo_nombre:
            periodo?.nombre ??
            "",
        };
      },
    )
    .sort(
      (a, b) =>
        Number(b.id) -
        Number(a.id),
    );
}


export async function localDeleteAlumno(
  id,
) {
  const database =
    getAcademicDatabase();

  const enrollmentIds =
    database.inscripciones
      .filter(
        (item) =>
          Number(
            item.alumno_id,
          ) === Number(id),
      )
      .map(
        (item) =>
          Number(item.id),
      );

  database.calificaciones =
    database.calificaciones.filter(
      (item) =>
        !enrollmentIds.includes(
          Number(
            item.inscripcion_id,
          ),
        ),
    );

  database.inscripciones =
    database.inscripciones.filter(
      (item) =>
        Number(
          item.alumno_id,
        ) !== Number(id),
    );

  database.alumnos =
    database.alumnos.filter(
      (item) =>
        Number(item.id) !==
        Number(id),
    );

  save(
    database,
    "alumnos",
  );

  return {
    ok: true,
  };
}


// ============================================================
// GRUPOS
// ============================================================

export async function localGetGrupos(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  let rows =
    database.grupos.map(
      (grupo) => {
        const carrera =
          getCarrera(
            database,
            grupo.carrera_id,
          );

        const periodo =
          getPeriodo(
            database,
            grupo.periodo_id,
          );

        const alumnos =
          database.inscripciones.filter(
            (item) =>
              Number(
                item.grupo_id,
              ) ===
                Number(
                  grupo.id,
                ) &&
              isActive(
                item.activa,
              ),
          ).length;

        return {
          ...clone(grupo),

          carrera:
            carrera?.nombre ??
            "",

          carrera_nombre:
            carrera?.nombre ??
            "",

          carrera_clave:
            carrera?.clave ??
            "",

          periodo:
            periodo?.nombre ??
            "",

          periodo_nombre:
            periodo?.nombre ??
            "",

          alumnos_count:
            alumnos,

          total_alumnos:
            alumnos,
        };
      },
    );

  if (filters.search) {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    rows =
      rows.filter(
        (item) =>
          item.nombre
            ?.toLowerCase()
            .includes(search),
      );
  }

  if (filters.carrera_id) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(
            filters.carrera_id,
          ),
      );
  }

  if (filters.semestre) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(
            filters.semestre,
          ),
      );
  }

  if (filters.periodo_id) {
    rows =
      rows.filter(
        (item) =>
          Number(
            item.periodo_id,
          ) ===
          Number(
            filters.periodo_id,
          ),
      );
  }

  if (
    filters.activo !== "" &&
    filters.activo !==
      undefined
  ) {
    const wanted =
      isActive(
        filters.activo,
      );

    rows =
      rows.filter(
        (item) =>
          isActive(
            item.activo,
          ) === wanted,
      );
  }

  return rows;
}


export async function localGetGrupoCatalogos() {
  const database =
    getAcademicDatabase();

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    periodos:
      database.periodos.map(
        clone,
      ),

    semestres:
      clone(
        SEMESTRES,
      ),
  };
}


export async function localCreateGrupo(
  grupo,
) {
  const database =
    getAcademicDatabase();

  const carrera =
    getCarrera(
      database,
      grupo.carrera_id,
    );

  const row = {
    id:
      nextId(
        database,
        "grupos",
      ),

    carrera_id:
      Number(
        grupo.carrera_id,
      ),

    semestre:
      Number(
        grupo.semestre,
      ),

    letra:
      grupo.letra ||
      "A",

    nombre:
      grupo.nombre ||
      `${carrera?.clave || "GRUPO"}-${grupo.semestre}${grupo.letra || "A"}`,

    periodo_id:
      Number(
        grupo.periodo_id ||
        getActivePeriod(
          database,
        )?.id,
      ),

    maestro_id:
      grupo.maestro_id ??
      null,

    activo:
      grupo.activo ??
      true,
  };

  database.grupos.push(
    row,
  );

  save(
    database,
    "grupos",
  );

  return clone(row);
}


export async function localUpdateGrupo(
  id,
  grupo,
) {
  const database =
    getAcademicDatabase();

  const index =
    database.grupos.findIndex(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (index === -1) {
    throw new Error(
      "El grupo no existe.",
    );
  }

  database.grupos[index] = {
    ...database.grupos[
      index
    ],

    ...clone(grupo),

    id:
      database.grupos[
        index
      ].id,
  };

  save(
    database,
    "grupos",
  );

  return clone(
    database.grupos[
      index
    ],
  );
}


export async function localUpdateGrupoEstado(
  id,
  activo,
) {
  return localUpdateGrupo(
    id,
    {
      activo,
    },
  );
}


export async function localDeleteGrupo(
  id,
) {
  const database =
    getAcademicDatabase();

  const hasStudents =
    database.inscripciones.some(
      (item) =>
        Number(
          item.grupo_id,
        ) === Number(id) &&
        isActive(
          item.activa,
        ),
    );

  if (hasStudents) {
    throw new Error(
      "No se puede eliminar un grupo que tiene alumnos activos.",
    );
  }

  database.grupos =
    database.grupos.filter(
      (item) =>
        Number(item.id) !==
        Number(id),
    );

  save(
    database,
    "grupos",
  );

  return {
    ok: true,
  };
}


export async function localGetGrupoAlumnos(
  id,
) {
  const database =
    getAcademicDatabase();

  const ids =
    database.inscripciones
      .filter(
        (item) =>
          Number(
            item.grupo_id,
          ) ===
            Number(id) &&
          isActive(
            item.activa,
          ),
      )
      .map(
        (item) =>
          Number(
            item.alumno_id,
          ),
      );

  return database.alumnos
    .filter(
      (alumno) =>
        ids.includes(
          Number(
            alumno.id,
          ),
        ),
    )
    .map(
      (alumno) =>
        enrichAlumno(
          database,
          alumno,
        ),
    );
}


export async function localGetGrupoMaterias(
  id,
) {
  const database =
    getAcademicDatabase();

  const grupo =
    getGrupo(
      database,
      id,
    );

  if (!grupo) {
    return [];
  }

  return localGetMaterias({
    carrera_id:
      grupo.carrera_id,

    semestre:
      grupo.semestre,

    activa:
      true,
  });
}


// ============================================================
// CALIFICACIONES
// ============================================================

export async function localGetCalificacionesCatalogos() {
  const database =
    getAcademicDatabase();

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    semestres:
      clone(
        SEMESTRES,
      ),
  };
}


export async function localSincronizarCalificaciones(
  carreraId,
  semestre,
) {
  const database =
    getAcademicDatabase();

  syncGradesInDatabase(
    database,
    carreraId,
    semestre,
  );

  save(
    database,
    "calificaciones",
  );

  return {
    ok: true,
  };
}


export async function localGetMatrizCalificaciones(
  carreraId,
  semestre,
) {
  const database =
    getAcademicDatabase();

  syncGradesInDatabase(
    database,
    carreraId,
    semestre,
  );

  saveAcademicDatabase(
    database,
  );

  const carrera =
    getCarrera(
      database,
      carreraId,
    );

  const materias =
    database.materias
      .filter(
        (materia) =>
          Number(
            materia.carrera_id,
          ) ===
            Number(
              carreraId,
            ) &&
          Number(
            materia.semestre,
          ) ===
            Number(
              semestre,
            ) &&
          isActive(
            materia.activa,
          ),
      )
      .sort(
        (a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            "es",
          ),
      );

  const inscripciones =
    database.inscripciones.filter(
      (item) =>
        Number(
          item.carrera_id,
        ) ===
          Number(
            carreraId,
          ) &&
        Number(
          item.semestre,
        ) ===
          Number(
            semestre,
          ) &&
        isActive(
          item.activa,
        ),
    );

  const alumnos =
    inscripciones
      .map(
        (inscripcion) => {
          const alumno =
            getAlumno(
              database,
              inscripcion.alumno_id,
            );

          if (
            !alumno ||
            alumno.estado !==
              "activo"
          ) {
            return null;
          }

          const grades =
            database.calificaciones.filter(
              (item) =>
                Number(
                  item.inscripcion_id,
                ) ===
                Number(
                  inscripcion.id,
                ),
            );

          const map = {};

          for (
            const materia
            of materias
          ) {
            const grade =
              grades.find(
                (item) =>
                  Number(
                    item.materia_id,
                  ) ===
                  Number(
                    materia.id,
                  ),
              );

            map[
              String(
                materia.id,
              )
            ] = {
              calificacion_id:
                grade?.id ??
                null,

              valor:
                grade?.promedio ??
                null,
            };
          }

          const valores =
            grades
              .map(
                (item) =>
                  item.promedio,
              )
              .filter(
                (value) =>
                  value !== null &&
                  value !==
                    undefined,
              );

          const promedio =
            average(
              valores,
            );

          let estado =
            "sin_evaluar";

          if (
            promedio !== null
          ) {
            if (
              promedio < 6.6
            ) {
              estado =
                "critico";
            } else if (
              promedio < 7
            ) {
              estado =
                "atencion";
            } else {
              estado =
                "en_regla";
            }
          }

          return {
            id:
              alumno.id,

            alumno_id:
              alumno.id,

            inscripcion_id:
              inscripcion.id,

            matricula:
              alumno.matricula,

            nombre:
              alumno.nombre,

            nombre_tabla:
              formatSurnameFirst(
                alumno.nombre,
              ),

            promedio,

            estado,

            calificaciones:
              map,
          };
        },
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.nombre_tabla.localeCompare(
            b.nombre_tabla,
            "es",
          ),
      );

  return {
    carrera: {
      id:
        carrera?.id ??
        Number(
          carreraId,
        ),

      nombre:
        carrera?.nombre ??
        "",

      clave:
        carrera?.clave ??
        "",
    },

    semestre:
      Number(
        semestre,
      ),

    materias:
      materias.map(
        clone,
      ),

    alumnos,

    resumen: {
      alumnos:
        alumnos.length,

      materias:
        materias.length,

      evaluados:
        alumnos.filter(
          (item) =>
            item.promedio !==
            null,
        ).length,

      en_riesgo:
        alumnos.filter(
          (item) =>
            item.promedio !==
              null &&
            item.promedio < 7,
        ).length,
    },
  };
}


export async function localGuardarMatrizCalificaciones(
  calificaciones,
) {
  const database =
    getAcademicDatabase();

  for (
    const item
    of calificaciones
  ) {
    const grade =
      database.calificaciones.find(
        (row) =>
          Number(
            row.id,
          ) ===
          Number(
            item.calificacion_id,
          ),
      );

    if (!grade) {
      continue;
    }

    const raw =
      item.calificacion;

    const value =
      raw === "" ||
      raw === null ||
      raw === undefined
        ? null
        : Number(raw);

    grade.parcial_1 =
      null;

    grade.parcial_2 =
      null;

    grade.parcial_3 =
      null;

    grade.promedio =
      Number.isFinite(
        value,
      )
        ? value
        : null;

    if (
      grade.promedio === null
    ) {
      grade.estado =
        "pendiente";
    } else if (
      grade.promedio >= 7
    ) {
      grade.estado =
        "aprobado";
    } else {
      grade.estado =
        "reprobado";
    }
  }

  save(
    database,
    "calificaciones",
  );

  window.dispatchEvent(
    new Event(
      "academic-risk-updated",
    ),
  );

  return {
    ok: true,
  };
}


// ============================================================
// ANÁLISIS
// ============================================================

function buildStudentAnalytics(
  database,
  filters = {},
) {
  let inscripciones =
    database.inscripciones.filter(
      (item) =>
        isActive(
          item.activa,
        ),
    );

  if (filters.carrera_id) {
    inscripciones =
      inscripciones.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(
            filters.carrera_id,
          ),
      );
  }

  if (filters.semestre) {
    inscripciones =
      inscripciones.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(
            filters.semestre,
          ),
      );
  }

  return inscripciones
    .map(
      (inscripcion) => {
        const alumno =
          getAlumno(
            database,
            inscripcion.alumno_id,
          );

        if (
          !alumno ||
          alumno.estado !==
            "activo"
        ) {
          return null;
        }

        const carrera =
          getCarrera(
            database,
            inscripcion.carrera_id,
          );

        const grupo =
          getGrupo(
            database,
            inscripcion.grupo_id,
          );

        const materias =
          database.materias.filter(
            (materia) =>
              Number(
                materia.carrera_id,
              ) ===
                Number(
                  inscripcion.carrera_id,
                ) &&
              Number(
                materia.semestre,
              ) ===
                Number(
                  inscripcion.semestre,
                ) &&
              isActive(
                materia.activa,
              ),
          );

        const grades =
          database.calificaciones.filter(
            (grade) =>
              Number(
                grade.inscripcion_id,
              ) ===
                Number(
                  inscripcion.id,
                ) &&
              materias.some(
                (materia) =>
                  Number(
                    materia.id,
                  ) ===
                  Number(
                    grade.materia_id,
                  ),
              ),
          );

        const evaluated =
          grades.filter(
            (grade) =>
              grade.promedio !==
                null &&
              grade.promedio !==
                undefined,
          );

        const promedio =
          average(
            evaluated.map(
              (grade) =>
                grade.promedio,
            ),
          );

        let estado =
          "sin_evaluacion";

        if (
          promedio !== null
        ) {
          if (
            promedio < 6.6
          ) {
            estado =
              "critico";
          } else if (
            promedio < 7
          ) {
            estado =
              "atencion";
          } else {
            estado =
              "en_regla";
          }
        }

        return {
          id:
            alumno.id,

          alumno_id:
            alumno.id,

          inscripcion_id:
            inscripcion.id,

          nombre:
            alumno.nombre,

          matricula:
            alumno.matricula,

          carrera_id:
            inscripcion.carrera_id,

          carrera:
            carrera?.nombre ??
            "",

          carrera_clave:
            carrera?.clave ??
            "",

          semestre:
            Number(
              inscripcion.semestre,
            ),

          grupo_id:
            inscripcion.grupo_id,

          grupo:
            grupo?.nombre ??
            "",

          promedio,

          estado,

          materias_total:
            materias.length,

          materias_evaluadas:
            evaluated.length,

          materias_pendientes:
            Math.max(
              materias.length -
                evaluated.length,
              0,
            ),

          grades,

          materias,
        };
      },
    )
    .filter(Boolean);
}


function buildAnalysis(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  const alumnos =
    buildStudentAnalytics(
      database,
      filters,
    );

  const evaluados =
    alumnos.filter(
      (item) =>
        item.promedio !==
        null,
    );

  const riesgo =
    evaluados.filter(
      (item) =>
        item.promedio < 7,
    );

  const criticos =
    evaluados.filter(
      (item) =>
        item.promedio < 6.6,
    );

  const atencion =
    evaluados.filter(
      (item) =>
        item.promedio >= 6.6 &&
        item.promedio < 7,
    );

  const enRegla =
    evaluados.filter(
      (item) =>
        item.promedio >= 7,
    );

  const groups =
    new Map();

  for (
    const alumno
    of alumnos
  ) {
    const key =
      `${alumno.carrera_id}-${alumno.semestre}`;

    if (!groups.has(key)) {
      groups.set(
        key,
        {
          carrera_id:
            alumno.carrera_id,

          carrera:
            alumno.carrera,

          carrera_clave:
            alumno.carrera_clave,

          semestre:
            alumno.semestre,

          alumnos: [],
        },
      );
    }

    groups
      .get(key)
      .alumnos
      .push(alumno);
  }

  const promedioPorSemestre =
    Array.from(
      groups.values(),
    )
      .map(
        (group) => {
          const evaluated =
            group.alumnos.filter(
              (item) =>
                item.promedio !==
                null,
            );

          return {
            carrera_id:
              group.carrera_id,

            carrera:
              group.carrera,

            carrera_clave:
              group.carrera_clave,

            semestre:
              group.semestre,

            nombre:
              `${group.carrera_clave} S${group.semestre}`,

            promedio:
              average(
                evaluated.map(
                  (item) =>
                    item.promedio,
                ),
              ),

            alumnos:
              group.alumnos.length,

            evaluados:
              evaluated.length,

            sin_evaluar:
              group.alumnos.length -
              evaluated.length,

            en_riesgo:
              evaluated.filter(
                (item) =>
                  item.promedio < 7,
              ).length,

            criticos:
              evaluated.filter(
                (item) =>
                  item.promedio < 6.6,
              ).length,

            atencion:
              evaluated.filter(
                (item) =>
                  item.promedio >=
                    6.6 &&
                  item.promedio <
                    7,
              ).length,
          };
        },
      )
      .sort(
        (a, b) =>
          a.carrera_clave.localeCompare(
            b.carrera_clave,
          ) ||
          a.semestre -
            b.semestre,
      );

  const careerGroups =
    new Map();

  for (
    const alumno
    of evaluados
  ) {
    if (
      !careerGroups.has(
        alumno.carrera_id,
      )
    ) {
      careerGroups.set(
        alumno.carrera_id,
        {
          carrera_id:
            alumno.carrera_id,

          carrera:
            alumno.carrera,

          carrera_clave:
            alumno.carrera_clave,

          values: [],
        },
      );
    }

    careerGroups
      .get(
        alumno.carrera_id,
      )
      .values.push(
        alumno.promedio,
      );
  }

  const promedioPorCarrera =
    Array.from(
      careerGroups.values(),
    ).map(
      (item) => ({
        carrera_id:
          item.carrera_id,

        carrera:
          item.carrera,

        carrera_clave:
          item.carrera_clave,

        promedio:
          average(
            item.values,
          ),
      }),
    );

  let materias =
    database.materias.filter(
      (item) =>
        isActive(
          item.activa,
        ),
    );

  if (filters.carrera_id) {
    materias =
      materias.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(
            filters.carrera_id,
          ),
      );
  }

  if (filters.semestre) {
    materias =
      materias.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(
            filters.semestre,
          ),
      );
  }

  const rankingMaterias =
    materias
      .map(
        (materia) => {
          const carrera =
            getCarrera(
              database,
              materia.carrera_id,
            );

          const values = [];

          for (
            const alumno
            of alumnos
          ) {
            const grade =
              alumno.grades.find(
                (item) =>
                  Number(
                    item.materia_id,
                  ) ===
                  Number(
                    materia.id,
                  ),
              );

            if (
              grade?.promedio !==
                null &&
              grade?.promedio !==
                undefined
            ) {
              values.push(
                Number(
                  grade.promedio,
                ),
              );
            }
          }

          return {
            materia_id:
              materia.id,

            clave:
              materia.clave,

            materia:
              materia.nombre,

            carrera_id:
              materia.carrera_id,

            carrera:
              carrera?.nombre ??
              "",

            carrera_clave:
              carrera?.clave ??
              "",

            semestre:
              Number(
                materia.semestre,
              ),

            promedio:
              average(values),

            evaluados:
              values.length,
          };
        },
      )
      .sort(
        (a, b) =>
          (
            b.promedio ??
            -1
          ) -
          (
            a.promedio ??
            -1
          ),
      );

  const distribution = [
    {
      rango:
        "0 - 5.99",
      cantidad: 0,
    },
    {
      rango:
        "6 - 6.59",
      cantidad: 0,
    },
    {
      rango:
        "6.60 - 6.99",
      cantidad: 0,
    },
    {
      rango:
        "7 - 7.99",
      cantidad: 0,
    },
    {
      rango:
        "8 - 8.99",
      cantidad: 0,
    },
    {
      rango:
        "9 - 10",
      cantidad: 0,
    },
  ];

  for (
    const alumno
    of evaluados
  ) {
    const value =
      alumno.promedio;

    if (value < 6) {
      distribution[0]
        .cantidad++;
    } else if (
      value < 6.6
    ) {
      distribution[1]
        .cantidad++;
    } else if (
      value < 7
    ) {
      distribution[2]
        .cantidad++;
    } else if (
      value < 8
    ) {
      distribution[3]
        .cantidad++;
    } else if (
      value < 9
    ) {
      distribution[4]
        .cantidad++;
    } else {
      distribution[5]
        .cantidad++;
    }
  }

  const insights = [];

  const validSemesters =
    promedioPorSemestre.filter(
      (item) =>
        item.promedio !==
        null,
    );

  if (
    validSemesters.length
  ) {
    const best =
      validSemesters.reduce(
        (current, item) =>
          !current ||
          item.promedio >
            current.promedio
            ? item
            : current,
        null,
      );

    const worst =
      validSemesters.reduce(
        (current, item) =>
          !current ||
          item.promedio <
            current.promedio
            ? item
            : current,
        null,
      );

    insights.push(
      `El mejor promedio actual corresponde a ${best.carrera_clave} semestre ${best.semestre} con ${best.promedio}.`,
    );

    if (
      validSemesters.length >
      1
    ) {
      insights.push(
        `El promedio más bajo corresponde a ${worst.carrera_clave} semestre ${worst.semestre} con ${worst.promedio}.`,
      );
    }
  }

  if (riesgo.length) {
    insights.push(
      `Actualmente hay ${riesgo.length} alumno(s) con promedio menor a 7.00.`,
    );
  }

  if (
    criticos.length
  ) {
    insights.push(
      `${criticos.length} alumno(s) tienen promedio menor a 6.60 y requieren mayor seguimiento.`,
    );
  }

  if (!insights.length) {
    insights.push(
      "Aún no hay suficiente información para generar hallazgos.",
    );
  }

  return {
    resumen: {
      total_alumnos:
        alumnos.length,

      evaluados:
        evaluados.length,

      sin_evaluacion:
        alumnos.length -
        evaluados.length,

      en_regla:
        enRegla.length,

      en_riesgo:
        riesgo.length,

      criticos:
        criticos.length,

      atencion:
        atencion.length,

      promedio_general:
        average(
          evaluados.map(
            (item) =>
              item.promedio,
          ),
        ),

      porcentaje_en_regla:
        evaluados.length
          ? Number(
              (
                enRegla.length /
                evaluados.length *
                100
              ).toFixed(1),
            )
          : 0,

      porcentaje_riesgo:
        evaluados.length
          ? Number(
              (
                riesgo.length /
                evaluados.length *
                100
              ).toFixed(1),
            )
          : 0,
    },

    promedio_por_semestre:
      promedioPorSemestre,

    promedio_por_carrera:
      promedioPorCarrera,

    alumnos_por_semestre:
      promedioPorSemestre.map(
        (item) => ({
          nombre:
            item.nombre,

          cantidad:
            item.alumnos,

          evaluados:
            item.evaluados,
        }),
      ),

    riesgo_por_semestre:
      promedioPorSemestre.map(
        (item) => ({
          nombre:
            item.nombre,

          en_riesgo:
            item.en_riesgo,

          criticos:
            item.criticos,

          atencion:
            item.atencion,
        }),
      ),

    ranking_materias:
      rankingMaterias,

    distribucion:
      distribution,

    insights,
  };
}


export async function localGetAnalisis(
  filters = {},
) {
  return buildAnalysis(
    filters,
  );
}


export async function localGetAnalisisCatalogos() {
  const database =
    getAcademicDatabase();

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    semestres:
      clone(
        SEMESTRES,
      ),
  };
}


// ============================================================
// DASHBOARD
// ============================================================

export async function localGetDashboard(
  carreraId = "",
) {
  const database =
    getAcademicDatabase();

  const filters =
    carreraId
      ? {
          carrera_id:
            carreraId,
        }
      : {};

  const analysis =
    buildAnalysis(
      filters,
    );

  const activeCareers =
    database.carreras.filter(
      (item) =>
        isActive(
          item.activa,
        ) &&
        (
          !carreraId ||
          Number(item.id) ===
            Number(carreraId)
        ),
    );

  const activeSubjects =
    database.materias.filter(
      (item) =>
        isActive(
          item.activa,
        ) &&
        (
          !carreraId ||
          Number(
            item.carrera_id,
          ) ===
            Number(carreraId)
        ),
    );

  return {
    catalogos: {
      carreras:
        database.carreras
          .filter(
            (item) =>
              isActive(
                item.activa,
              ),
          )
          .map(clone),
    },

    resumen: {
      alumnos:
        analysis.resumen
          .total_alumnos,

      carreras:
        activeCareers.length,

      materias:
        activeSubjects.length,

      promedio_general:
        analysis.resumen
          .promedio_general,

      evaluados:
        analysis.resumen
          .evaluados,

      sin_evaluacion:
        analysis.resumen
          .sin_evaluacion,

      en_riesgo:
        analysis.resumen
          .en_riesgo,

      criticos:
        analysis.resumen
          .criticos,

      atencion:
        analysis.resumen
          .atencion,

      en_regla:
        analysis.resumen
          .en_regla,
    },

    promedio_por_carrera:
      analysis
        .promedio_por_carrera,

    promedio_por_semestre:
      analysis
        .promedio_por_semestre,

    alumnos_por_semestre:
      analysis
        .alumnos_por_semestre,

    riesgo_por_semestre:
      analysis
        .riesgo_por_semestre,
  };
}


// ============================================================
// RIESGO
// ============================================================

function buildRiskStudents(
  filters = {},
) {
  const database =
    getAcademicDatabase();

  let alumnos =
    buildStudentAnalytics(
      database,
      filters,
    );

  alumnos =
    alumnos.map(
      (item) => {
        let needed =
          null;

        if (
          item.materias_pendientes >
            0 &&
          item.materias_evaluadas >
            0
        ) {
          const sum =
            item.grades
              .filter(
                (grade) =>
                  grade.promedio !==
                    null &&
                  grade.promedio !==
                    undefined,
              )
              .reduce(
                (
                  total,
                  grade,
                ) =>
                  total +
                  Number(
                    grade.promedio,
                  ),
                0,
              );

          needed =
            Number(
              (
                (
                  7 *
                  item.materias_total -
                  sum
                ) /
                item.materias_pendientes
              ).toFixed(2),
            );
        }

        let nivel =
          "sin_evaluacion";

        let estado_riesgo =
          "sin_evaluacion";

        if (
          item.promedio !== null
        ) {
          if (
            item.promedio <
            6.6
          ) {
            nivel =
              "alto";

            estado_riesgo =
              "critico";
          } else if (
            item.promedio <
            7
          ) {
            nivel =
              "medio";

            estado_riesgo =
              "atencion";
          } else {
            nivel =
              "bajo";

            estado_riesgo =
              "en_regla";
          }
        }

        return {
          ...item,

          promedio_actual:
            item.promedio,

          nivel,

          estado_riesgo,

          promedio_necesario_pendientes:
            needed,
        };
      },
    );

  if (filters.grupo_id) {
    alumnos =
      alumnos.filter(
        (item) =>
          Number(
            item.grupo_id,
          ) ===
          Number(
            filters.grupo_id,
          ),
      );
  }

  if (filters.alumno_id) {
    alumnos =
      alumnos.filter(
        (item) =>
          Number(
            item.alumno_id,
          ) ===
          Number(
            filters.alumno_id,
          ),
      );
  }

  if (filters.materia_id) {
    alumnos =
      alumnos.filter(
        (item) =>
          item.grades.some(
            (grade) =>
              Number(
                grade.materia_id,
              ) ===
              Number(
                filters.materia_id,
              ),
          ),
      );
  }

  if (filters.search) {
    const search =
      filters.search
        .toLowerCase()
        .trim();

    alumnos =
      alumnos.filter(
        (item) =>
          item.nombre
            .toLowerCase()
            .includes(search) ||
          item.matricula
            ?.toLowerCase()
            .includes(search),
      );
  }


  // ==========================================================
  // FILTRO DE ESTADO DE RIESGO
  // ==========================================================

  if (filters.estado_riesgo) {
    const filtro =
      String(
        filters.estado_riesgo,
      )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .replace(
          /[\s-]+/g,
          "_",
        );

    if (
      filtro ===
        "riesgo" ||
      filtro ===
        "en_riesgo"
    ) {
      alumnos =
        alumnos.filter(
          (item) =>
            item.promedio_actual !==
              null &&
            item.promedio_actual <
              7,
        );
    } else if (
      filtro ===
        "critico" ||
      filtro ===
        "alto"
    ) {
      alumnos =
        alumnos.filter(
          (item) =>
            item.promedio_actual !==
              null &&
            item.promedio_actual <
              6.6,
        );
    } else if (
      filtro ===
        "atencion" ||
      filtro ===
        "medio"
    ) {
      alumnos =
        alumnos.filter(
          (item) =>
            item.promedio_actual !==
              null &&
            item.promedio_actual >=
              6.6 &&
            item.promedio_actual <
              7,
        );
    } else if (
      filtro ===
        "en_regla" ||
      filtro ===
        "fuera_de_riesgo" ||
      filtro ===
        "fuera_riesgo" ||
      filtro ===
        "bajo"
    ) {
      alumnos =
        alumnos.filter(
          (item) =>
            item.promedio_actual !==
              null &&
            item.promedio_actual >=
              7,
        );
    } else if (
      filtro ===
        "sin_evaluacion"
    ) {
      alumnos =
        alumnos.filter(
          (item) =>
            item.promedio_actual ===
            null,
        );
    }
  }

  return alumnos;
}


export async function localGetRiesgo(
  filters = {},
) {
  const alumnos =
    buildRiskStudents(
      filters,
    );

  const evaluados =
    alumnos.filter(
      (item) =>
        item.promedio_actual !==
        null,
    );

  const riesgos =
    evaluados.filter(
      (item) =>
        item.promedio_actual <
        7,
    );

  return {
    resumen: {
      total_alumnos:
        alumnos.length,

      evaluados:
        evaluados.length,

      en_riesgo:
        riesgos.length,

      criticos:
        riesgos.filter(
          (item) =>
            item.promedio_actual <
            6.6,
        ).length,

      atencion:
        riesgos.filter(
          (item) =>
            item.promedio_actual >=
              6.6 &&
            item.promedio_actual <
              7,
        ).length,

      promedio_general:
        average(
          evaluados.map(
            (item) =>
              item.promedio_actual,
          ),
        ),
    },

    alumnos,

    riesgos:
      alumnos,
  };
}


export async function localGetRiesgoCatalogos(
  carreraId = "",
  semestre = "",
) {
  const database =
    getAcademicDatabase();

  let grupos =
    database.grupos.filter(
      (item) =>
        isActive(
          item.activo,
        ),
    );

  let materias =
    database.materias.filter(
      (item) =>
        isActive(
          item.activa,
        ),
    );

  if (carreraId) {
    grupos =
      grupos.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(carreraId),
      );

    materias =
      materias.filter(
        (item) =>
          Number(
            item.carrera_id,
          ) ===
          Number(carreraId),
      );
  }

  if (semestre) {
    grupos =
      grupos.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(semestre),
      );

    materias =
      materias.filter(
        (item) =>
          Number(
            item.semestre,
          ) ===
          Number(semestre),
      );
  }

  return {
    carreras:
      database.carreras
        .filter(
          (item) =>
            isActive(
              item.activa,
            ),
        )
        .map(clone),

    semestres:
      clone(
        SEMESTRES,
      ),

    grupos:
      grupos.map(clone),

    materias:
      materias.map(clone),
  };
}


export async function localGetNotificacionesRiesgo() {
  const alumnos =
    buildRiskStudents()
      .filter(
        (item) =>
          item.promedio_actual !==
            null &&
          item.promedio_actual <
            7,
      )
      .sort(
        (a, b) =>
          a.promedio_actual -
          b.promedio_actual,
      );

  return {
    cantidad:
      alumnos.length,

    notificaciones:
      alumnos.map(
        (item) => ({
          id:
            item.alumno_id,

          alumno_id:
            item.alumno_id,

          nombre:
            item.nombre,

          matricula:
            item.matricula,

          carrera_clave:
            item.carrera_clave,

          carrera:
            item.carrera,

          grupo:
            item.grupo,

          semestre:
            item.semestre,

          promedio_actual:
            item.promedio_actual,

          nivel:
            item.nivel,

          materias_pendientes:
            item.materias_pendientes,

          promedio_necesario_pendientes:
            item
              .promedio_necesario_pendientes,
        }),
      ),
  };
}


// ============================================================
// USUARIOS + LOGIN LOCAL
// ============================================================

function initializeUsers() {
  const stored =
    localStorage.getItem(
      USERS_KEY,
    );

  if (stored) {
    try {
      return JSON.parse(
        stored,
      );
    } catch {
      localStorage.removeItem(
        USERS_KEY,
      );
    }
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(
      DEMO_USERS,
    ),
  );

  return clone(
    DEMO_USERS,
  );
}


function saveUsers(
  users,
) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users),
  );
}


function publicUser(
  user,
) {
  const {
    password,
    ...safe
  } = user;

  return {
    ...safe,

    name:
      safe.nombre,

    estado:
      isActive(
        safe.activo,
      )
        ? "activo"
        : "inactivo",
  };
}


export async function localLogin(
  correo,
  password,
) {
  const users =
    initializeUsers();

  const user =
    users.find(
      (item) =>
        item.correo
          .toLowerCase() ===
          String(
            correo,
          ).toLowerCase(),
    );

  if (
    !user ||
    user.password !==
      password
  ) {
    throw new Error(
      "Correo o contraseña incorrectos.",
    );
  }

  if (
    !isActive(
      user.activo,
    )
  ) {
    throw new Error(
      "La cuenta está inactiva.",
    );
  }

  const safe =
    publicUser(
      user,
    );

  const token =
    `local-demo-${user.id}-${Date.now()}`;

  return {
    access_token:
      token,

    token,

    token_type:
      "bearer",

    usuario:
      safe,

    user:
      safe,
  };
}


export async function localRegister(
  nombre,
  correo,
  password,
) {
  const users =
    initializeUsers();

  if (
    users.some(
      (item) =>
        item.correo
          .toLowerCase() ===
        correo.toLowerCase(),
    )
  ) {
    throw new Error(
      "Ya existe una cuenta con ese correo.",
    );
  }

  const row = {
    id:
      users.length
        ? Math.max(
            ...users.map(
              (item) =>
                Number(
                  item.id,
                ),
            ),
          ) + 1
        : 1,

    nombre:
      nombre.trim(),

    correo:
      correo.trim(),

    password,

    rol:
      "maestro",

    activo:
      true,

    demo:
      false,
  };

  users.push(row);

  saveUsers(users);

  return publicUser(
    row,
  );
}


export async function localGetUsuarios(
  filters = {},
) {
  let users =
    initializeUsers()
      .map(
        publicUser,
      );

  if (filters.search) {
    const search =
      filters.search
        .toLowerCase()
        .trim();

    users =
      users.filter(
        (item) =>
          item.nombre
            .toLowerCase()
            .includes(search) ||
          item.correo
            .toLowerCase()
            .includes(search),
      );
  }

  if (filters.rol) {
    users =
      users.filter(
        (item) =>
          item.rol ===
          filters.rol,
      );
  }

  if (
    filters.activo !== "" &&
    filters.activo !==
      undefined &&
    filters.activo !==
      null
  ) {
    const wanted =
      isActive(
        filters.activo,
      );

    users =
      users.filter(
        (item) =>
          isActive(
            item.activo,
          ) === wanted,
      );
  }

  return users;
}


export async function localCreateUsuario(
  data,
) {
  const users =
    initializeUsers();

  if (
    users.some(
      (item) =>
        item.correo
          .toLowerCase() ===
        data.correo
          .toLowerCase(),
    )
  ) {
    throw new Error(
      "Ya existe un usuario con ese correo.",
    );
  }

  const row = {
    id:
      users.length
        ? Math.max(
            ...users.map(
              (item) =>
                Number(item.id),
            ),
          ) + 1
        : 1,

    nombre:
      data.nombre,

    correo:
      data.correo,

    password:
      data.password ||
      "Demo123!",

    rol:
      data.rol ||
      "maestro",

    activo:
      data.activo ??
      true,

    demo:
      false,
  };

  users.push(row);

  saveUsers(users);

  return publicUser(
    row,
  );
}


export async function localUpdateUsuario(
  id,
  data,
) {
  const users =
    initializeUsers();

  const index =
    users.findIndex(
      (item) =>
        Number(item.id) ===
        Number(id),
    );

  if (index === -1) {
    throw new Error(
      "El usuario no existe.",
    );
  }

  users[index] = {
    ...users[index],
    ...clone(data),

    id:
      users[index].id,

    password:
      data.password ||
      users[index].password,
  };

  saveUsers(users);

  return publicUser(
    users[index],
  );
}


export async function localUpdateUsuarioEstado(
  id,
  activo,
) {
  return localUpdateUsuario(
    id,
    {
      activo,
    },
  );
}


export async function localUpdateUsuarioPassword(
  id,
  password,
) {
  return localUpdateUsuario(
    id,
    {
      password,
    },
  );
}


export async function localDeleteUsuario(
  id,
) {
  let users =
    initializeUsers();

  users =
    users.filter(
      (item) =>
        Number(item.id) !==
        Number(id),
    );

  saveUsers(users);

  return {
    ok: true,
  };
}