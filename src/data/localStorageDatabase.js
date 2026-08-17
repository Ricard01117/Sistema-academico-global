import academicSeed from "./academicSeed";


const STORAGE_KEY =
  "academic-global-database";

const STORAGE_VERSION_KEY =
  "academic-global-database-version";

const CURRENT_VERSION =
  String(
    academicSeed.version || 1,
  );


const TABLES = [
  "carreras",
  "periodos",
  "materias",
  "grupos",
  "alumnos",
  "inscripciones",
  "calificaciones",
];


function clone(value) {
  return JSON.parse(
    JSON.stringify(value),
  );
}


function createInitialDatabase() {
  return {
    version:
      academicSeed.version || 1,

    carreras:
      clone(
        academicSeed.carreras || [],
      ),

    periodos:
      clone(
        academicSeed.periodos || [],
      ),

    materias:
      clone(
        academicSeed.materias || [],
      ),

    grupos:
      clone(
        academicSeed.grupos || [],
      ),

    alumnos:
      clone(
        academicSeed.alumnos || [],
      ),

    inscripciones:
      clone(
        academicSeed.inscripciones || [],
      ),

    calificaciones:
      clone(
        academicSeed.calificaciones || [],
      ),
  };
}


export function initializeAcademicDatabase() {
  const existing =
    localStorage.getItem(
      STORAGE_KEY,
    );


  if (existing) {
    try {
      const parsed =
        JSON.parse(existing);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(
        STORAGE_KEY,
      );
    }
  }


  const database =
    createInitialDatabase();


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(database),
  );


  localStorage.setItem(
    STORAGE_VERSION_KEY,
    CURRENT_VERSION,
  );


  return database;
}


export function getAcademicDatabase() {
  const stored =
    localStorage.getItem(
      STORAGE_KEY,
    );


  if (!stored) {
    return initializeAcademicDatabase();
  }


  try {
    return JSON.parse(
      stored,
    );
  } catch {
    return resetAcademicDatabase();
  }
}


export function saveAcademicDatabase(
  database,
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(database),
  );

  return database;
}


export function resetAcademicDatabase() {
  const database =
    createInitialDatabase();


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(database),
  );


  localStorage.setItem(
    STORAGE_VERSION_KEY,
    CURRENT_VERSION,
  );


  window.dispatchEvent(
    new CustomEvent(
      "academic-database-updated",
    ),
  );


  return database;
}


export function clearAcademicDatabase() {
  localStorage.removeItem(
    STORAGE_KEY,
  );

  localStorage.removeItem(
    STORAGE_VERSION_KEY,
  );
}


export function getTable(
  tableName,
) {
  if (
    !TABLES.includes(
      tableName,
    )
  ) {
    throw new Error(
      `Tabla local no válida: ${tableName}`,
    );
  }


  const database =
    getAcademicDatabase();


  return clone(
    database[tableName] || [],
  );
}


export function setTable(
  tableName,
  rows,
) {
  if (
    !TABLES.includes(
      tableName,
    )
  ) {
    throw new Error(
      `Tabla local no válida: ${tableName}`,
    );
  }


  const database =
    getAcademicDatabase();


  database[tableName] =
    clone(rows);


  saveAcademicDatabase(
    database,
  );


  notifyDatabaseUpdated(
    tableName,
  );


  return clone(
    database[tableName],
  );
}


export function nextId(
  tableName,
) {
  const rows =
    getTable(
      tableName,
    );


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


export function findById(
  tableName,
  id,
) {
  const rows =
    getTable(
      tableName,
    );


  return (
    rows.find(
      (row) =>
        Number(row.id) ===
        Number(id),
    ) || null
  );
}


export function insertRow(
  tableName,
  data,
) {
  const rows =
    getTable(
      tableName,
    );


  const row = {
    ...clone(data),

    id:
      data.id ||
      nextId(
        tableName,
      ),
  };


  rows.push(
    row,
  );


  setTable(
    tableName,
    rows,
  );


  return clone(
    row,
  );
}


export function updateRow(
  tableName,
  id,
  changes,
) {
  const rows =
    getTable(
      tableName,
    );


  const index =
    rows.findIndex(
      (row) =>
        Number(row.id) ===
        Number(id),
    );


  if (index === -1) {
    throw new Error(
      `No se encontró el registro ${id} en ${tableName}`,
    );
  }


  rows[index] = {
    ...rows[index],
    ...clone(changes),

    id:
      rows[index].id,
  };


  setTable(
    tableName,
    rows,
  );


  return clone(
    rows[index],
  );
}


export function deleteRow(
  tableName,
  id,
) {
  const rows =
    getTable(
      tableName,
    );


  const nextRows =
    rows.filter(
      (row) =>
        Number(row.id) !==
        Number(id),
    );


  setTable(
    tableName,
    nextRows,
  );


  return true;
}


export function updateDatabase(
  updater,
) {
  const database =
    getAcademicDatabase();


  const workingCopy =
    clone(database);


  const result =
    updater(
      workingCopy,
    );


  const finalDatabase =
    result ||
    workingCopy;


  saveAcademicDatabase(
    finalDatabase,
  );


  notifyDatabaseUpdated(
    "all",
  );


  return clone(
    finalDatabase,
  );
}


export function notifyDatabaseUpdated(
  tableName = "all",
) {
  window.dispatchEvent(
    new CustomEvent(
      "academic-database-updated",
      {
        detail: {
          table:
            tableName,
        },
      },
    ),
  );
}


export function getDatabaseStats() {
  const database =
    getAcademicDatabase();


  return {
    carreras:
      database.carreras.length,

    periodos:
      database.periodos.length,

    materias:
      database.materias.length,

    grupos:
      database.grupos.length,

    alumnos:
      database.alumnos.length,

    inscripciones:
      database.inscripciones.length,

    calificaciones:
      database.calificaciones.length,
  };
}


export {
  STORAGE_KEY,
  STORAGE_VERSION_KEY,
};