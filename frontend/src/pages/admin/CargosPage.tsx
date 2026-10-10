
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type Cargo = {
  id: number
  nombre: string
  descripcion: string | null
  permite_multiples: boolean
  activo: boolean
}

function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [permiteMultiples, setPermiteMultiples] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  useEffect(() => {
    async function cargarCargos() {
      try {
        const response = await fetch(
          'http://localhost:8000/api/organizacion/cargos/',
          {
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || 'No fue posible cargar los cargos.'
          )
        }

        setCargos(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar los cargos.'
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarCargos()
  }, [])

  async function crearCargo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGuardando(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/organizacion/cargos/',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre,
            descripcion,
            permite_multiples: permiteMultiples,
            activo: true,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No fue posible crear el cargo.'
        )
      }

      setCargos((actuales) => [...actuales, data])
      setNombre('')
      setDescripcion('')
      setPermiteMultiples(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al crear el cargo.'
      )
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstadoCargo(cargo: Cargo) {
    setError('')
    setProcesandoId(cargo.id)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/cargos/${cargo.id}/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activo: !cargo.activo,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No fue posible actualizar el cargo.'
        )
      }

      setCargos((actuales) =>
        actuales.map((item) =>
          item.id === cargo.id ? data : item
        )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al actualizar el cargo.'
      )
    } finally {
      setProcesandoId(null)
    }
  }

  const cargosActivos =
    cargos.filter((cargo) => cargo.activo).length

  const cargosInactivos = cargos.length - cargosActivos

  const cargosMultiples =
    cargos.filter((cargo) => cargo.permite_multiples).length

  return (
    <main className="cargos-bosque">
      <style>{`
        /* FONDO PRINCIPAL */

        .cargos-bosque {
          --cb-oro: #d7ac32;
          --cb-oro-claro: #f0d375;
          --cb-crema: #f6efd9;
          --cb-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 16px;

          color: var(--cb-crema);
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/cargos.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .cargos-bosque,
        .cargos-bosque * {
          box-sizing: border-box;
        }

        .cargos-bosque .cb-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* PANELES VERDE BOSQUE */

        .cargos-bosque .cb-panel {
          background: rgba(8, 29, 19, 0.77);
          border: 1px solid rgba(215, 172, 50, 0.30);
          border-radius: 23px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.16);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TITULOS */

        .cargos-bosque h1,
        .cargos-bosque h2,
        .cargos-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--cb-crema);
          line-height: 1.2;
        }

        .cargos-bosque .cb-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .cargos-bosque .cb-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cargos-bosque .cb-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .cargos-bosque .cb-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }

        .cargos-bosque .cb-subtitle {
          margin: 0;
          max-width: 800px;
          color: var(--cb-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        /* ETIQUETAS */

        .cargos-bosque .cb-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 6px 15px;
          border-radius: 999px;

          border: 1px solid rgba(215, 172, 50, 0.48);
          background: rgba(215, 172, 50, 0.13);

          color: #e9c454;
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
        }

        .cargos-bosque .cb-badge-green {
          color: #a6eac4;
          border-color: rgba(80, 183, 125, 0.5);
          background: rgba(28, 125, 78, 0.20);
        }

        .cargos-bosque .cb-badge-muted {
          color: #e6e9df;
          border-color: rgba(220, 220, 200, 0.25);
          background: rgba(230, 230, 210, 0.08);
        }

        /* BOTONES */

        .cargos-bosque .cb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 45px;
          padding: 12px 22px;

          border: 1px solid rgba(215, 172, 50, 0.65);
          border-radius: 15px;

          background: rgba(7, 26, 17, 0.60);
          color: var(--cb-crema);

          font: inherit;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .cargos-bosque .cb-button:hover {
          background: rgba(215, 172, 50, 0.20);
          border-color: #e9c454;
          color: #fff7de;
        }

        .cargos-bosque .cb-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );

          border-color: #d7ac32;
          color: #102419;
          font-weight: 750;

          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .cargos-bosque .cb-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
          transform: translateY(-1px);
        }

        .cargos-bosque .cb-button-danger {
          background: rgba(128, 37, 40, 0.24);
          border-color: rgba(225, 110, 110, 0.70);
          color: #ffc2bf;
        }

        .cargos-bosque .cb-button-danger:hover {
          background: rgba(165, 50, 52, 0.55);
          border-color: #ef9c98;
          color: #fff0ee;
        }

        .cargos-bosque .cb-button-success {
          background: rgba(28, 125, 78, 0.20);
          border-color: rgba(80, 183, 125, 0.60);
          color: #a6eac4;
        }

        .cargos-bosque .cb-button-success:hover {
          background: rgba(28, 125, 78, 0.43);
          color: #e0ffe9;
        }

        .cargos-bosque .cb-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* TARJETAS ESTADISTICAS */

        .cargos-bosque .cb-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .cargos-bosque .cb-stat {
          padding: 23px 25px;

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .cargos-bosque .cb-stat:hover {
          transform: translateY(-3px);
          background: rgba(12, 43, 26, 0.85);
        }

        .cargos-bosque .cb-stat-label {
          margin: 0 0 15px;
          color: #d1d6c7;
          font-size: 15px;
          font-weight: 600;
        }

        .cargos-bosque .cb-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .cargos-bosque .cb-stat-number {
          color: var(--cb-oro);
          font-size: 35px;
          line-height: 1;
          font-weight: 800;
        }

        /* FORMULARIO */

        .cargos-bosque .cb-form-panel {
          margin-bottom: 32px;
          overflow: hidden;
        }

        .cargos-bosque .cb-form-header {
          padding: 26px 30px;
          border-bottom: 1px solid rgba(215, 172, 50, 0.20);
        }

        .cargos-bosque .cb-form-title {
          margin: 0;
          font-size: clamp(25px, 2.5vw, 33px);
        }

        .cargos-bosque .cb-form-body {
          padding: 30px;
        }

        .cargos-bosque .cb-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .cargos-bosque .cb-label {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;

          margin-bottom: 10px;
          color: #f0eddf;
          font-size: 15px;
          font-weight: 650;
        }

        .cargos-bosque .cb-required {
          color: #f0b3a3;
          font-weight: 400;
        }

        .cargos-bosque .cb-optional {
          color: #b6c0b3;
          font-weight: 400;
        }

        /* INPUTS */

        .cargos-bosque .cb-input {
          display: block;
          width: 100%;
          min-height: 50px;
          padding: 12px 16px;

          border: 1px solid rgba(215, 172, 50, 0.33);
          border-radius: 13px;

          background: rgba(3, 20, 12, 0.67);
          color: #f7f1df;

          font: inherit;
          font-size: 15px;
          outline: none;
        }

        .cargos-bosque .cb-input::placeholder {
          color: #aab8aa;
          opacity: 1;
        }

        .cargos-bosque .cb-input:focus {
          border-color: #e8c657;
          box-shadow:
            0 0 0 3px rgba(215, 172, 50, 0.15);
        }

        /* OPCION MULTIPLES INTEGRANTES */

        .cargos-bosque .cb-check-card {
          margin-top: 22px;
          padding: 20px;

          border: 1px solid rgba(215, 172, 50, 0.28);
          border-radius: 16px;

          background: rgba(215, 172, 50, 0.07);
        }

        .cargos-bosque .cb-check-label {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
        }

        .cargos-bosque .cb-checkbox {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          margin-top: 2px;

          accent-color: #d7ac32;
          cursor: pointer;
        }

        .cargos-bosque .cb-check-title {
          margin: 0;
          color: #f6efd9;
          font-size: 16px;
          font-weight: 700;
        }

        .cargos-bosque .cb-check-description {
          margin: 6px 0 0;
          color: #c4cfbf;
          font-size: 14px;
          line-height: 1.6;
        }

        .cargos-bosque .cb-form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 24px;

          border-top: 1px solid rgba(215, 172, 50, 0.20);
        }

        /* MENSAJES DE ERROR */

        .cargos-bosque .cb-alert-error {
          padding: 15px 19px;
          margin-bottom: 24px;

          border: 1px solid rgba(231, 104, 104, 0.5);
          border-radius: 13px;

          background: rgba(118, 33, 35, 0.84);
          color: #ffe4e4;
          font-size: 15px;
        }

        /* SECCION DE CARGOS REGISTRADOS */

        .cargos-bosque .cb-list-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 18px;
        }

        .cargos-bosque .cb-section-heading {
          margin: 0 0 12px;
          font-size: 30px;
        }

        /* SIN REGISTROS */

        .cargos-bosque .cb-empty {
          padding: 55px 25px;
          text-align: center;
        }

        .cargos-bosque .cb-empty-icon {
          display: grid;
          place-items: center;

          width: 68px;
          height: 68px;
          margin: 0 auto 20px;

          border-radius: 50%;
          background: rgba(215, 172, 50, 0.16);
          color: #e9c454;

          font-size: 26px;
          font-weight: 800;
        }

        .cargos-bosque .cb-empty h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .cargos-bosque .cb-empty p {
          max-width: 470px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        /* TABLA */

        .cargos-bosque .cb-table-scroll {
          overflow-x: auto;
          border-radius: 23px;
        }

        .cargos-bosque .cb-table {
          width: 100%;
          border-collapse: collapse;
          color: #f1eddf;
          font-size: 14px;
        }

        .cargos-bosque .cb-table thead {
          background: rgba(215, 172, 50, 0.13);
        }

        .cargos-bosque .cb-table th {
          padding: 18px;
          color: #ebce70;
          text-align: left;
          font-weight: 700;
          white-space: nowrap;
        }

        .cargos-bosque .cb-table td {
          padding: 18px;
          border-top: 1px solid rgba(215, 172, 50, 0.15);
          vertical-align: middle;
        }

        .cargos-bosque .cb-table tbody tr:hover {
          background: rgba(215, 172, 50, 0.07);
        }

        .cargos-bosque .cb-avatar {
          display: grid;
          place-items: center;

          width: 43px;
          height: 43px;
          flex-shrink: 0;

          border-radius: 13px;
          background: rgba(215, 172, 50, 0.17);
          color: #e9c454;

          font-weight: 800;
          font-size: 17px;
        }

        .cargos-bosque .cb-muted {
          color: #bfcbbe;
        }

        .cargos-bosque .cb-loading {
          padding: 45px;
          text-align: center;
          color: #ebce70;
        }

        /* ACCESIBILIDAD */

        .cargos-bosque button:focus-visible,
        .cargos-bosque a:focus-visible,
        .cargos-bosque .cb-input:focus-visible,
        .cargos-bosque .cb-checkbox:focus-visible {
          outline: 2px solid #e8c657;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .cargos-bosque .cb-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .cargos-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .cargos-bosque .cb-header,
          .cargos-bosque .cb-form-header,
          .cargos-bosque .cb-form-body {
            padding: 22px;
          }

          .cargos-bosque .cb-fields {
            grid-template-columns: 1fr;
          }

          .cargos-bosque .cb-stats {
            gap: 12px;
          }

          .cargos-bosque .cb-stat {
            padding: 18px;
          }

          .cargos-bosque .cb-stat-number {
            font-size: 30px;
          }
        }

        @media (max-width: 420px) {
          .cargos-bosque .cb-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="cb-container">

        {/* ENCABEZADO */}

        <div className="cb-panel cb-header">
          <div className="cb-header-row">
            <div>
              <div className="cb-title-row">
                <h1 className="cb-title">
                  Gestión de Cargos
                </h1>

                <span className="cb-badge">
                  Administración
                </span>
              </div>

              <p className="cb-subtitle">
                Administra los cargos disponibles para las
                directivas y define cuáles permiten múltiples
                integrantes.
              </p>
            </div>

            <Link
              to="/admin"
              className="cb-button"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* ESTADISTICAS */}

        {!cargando && (
          <div className="cb-stats">

            <div className="cb-panel cb-stat">
              <p className="cb-stat-label">
                Total cargos
              </p>

              <div className="cb-stat-bottom">
                <span className="cb-stat-number">
                  {cargos.length}
                </span>

                <span className="cb-badge">
                  Registrados
                </span>
              </div>
            </div>

            <div className="cb-panel cb-stat">
              <p className="cb-stat-label">
                Activos
              </p>

              <div className="cb-stat-bottom">
                <span className="cb-stat-number">
                  {cargosActivos}
                </span>

                <span className="cb-badge cb-badge-green">
                  Activos
                </span>
              </div>
            </div>

            <div className="cb-panel cb-stat">
              <p className="cb-stat-label">
                Inactivos
              </p>

              <div className="cb-stat-bottom">
                <span className="cb-stat-number">
                  {cargosInactivos}
                </span>

                <span className="cb-badge cb-badge-muted">
                  Inactivos
                </span>
              </div>
            </div>

            <div className="cb-panel cb-stat">
              <p className="cb-stat-label">
                Permiten múltiples
              </p>

              <div className="cb-stat-bottom">
                <span className="cb-stat-number">
                  {cargosMultiples}
                </span>

                <span className="cb-badge">
                  Múltiples
                </span>
              </div>
            </div>

          </div>
        )}

        {/* FORMULARIO CREAR CARGO */}

        <form
          onSubmit={crearCargo}
          className="cb-panel cb-form-panel"
        >
          <div className="cb-form-header">
            <div className="cb-title-row">
              <h2 className="cb-form-title">
                Crear nuevo cargo
              </h2>

              <span className="cb-badge">
                Nuevo
              </span>
            </div>

            <p className="cb-subtitle">
              Define un nuevo cargo para las directivas.
            </p>
          </div>

          <div className="cb-form-body">

            {/* MENSAJES */}

            {error && (
              <div
                className="cb-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* CAMPOS */}

            <div className="cb-fields">

              <label>
                <span className="cb-label">
                  Nombre
                  <span className="cb-required">
                    Obligatorio
                  </span>
                </span>

                <input
                  type="text"
                  className="cb-input"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(event.target.value)
                  }
                  placeholder="Ej: Presidente"
                  required
                />
              </label>

              <label>
                <span className="cb-label">
                  Descripción
                  <span className="cb-optional">
                    Opcional
                  </span>
                </span>

                <input
                  type="text"
                  className="cb-input"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Describe brevemente las funciones del cargo"
                />
              </label>

            </div>

            {/* PERMITIR MULTIPLES INTEGRANTES */}

            <div className="cb-check-card">
              <label className="cb-check-label">
                <input
                  type="checkbox"
                  className="cb-checkbox"
                  checked={permiteMultiples}
                  onChange={(event) =>
                    setPermiteMultiples(event.target.checked)
                  }
                />

                <div>
                  <p className="cb-check-title">
                    Permitir múltiples integrantes
                  </p>

                  <p className="cb-check-description">
                    Activa esta opción si más de una persona
                    puede ocupar este cargo simultáneamente
                    dentro de una directiva.
                  </p>
                </div>
              </label>
            </div>

            {/* BOTON CREAR */}

            <div className="cb-form-actions">
              <button
                type="submit"
                className="cb-button cb-button-primary"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : 'Crear cargo'}
              </button>
            </div>

          </div>
        </form>

        {/* CARGANDO */}

        {cargando && (
          <div className="cb-panel cb-loading">
            <span className="loading loading-spinner loading-lg" />

            <p style={{ marginTop: 16 }}>
              Cargando cargos...
            </p>
          </div>
        )}

        {/* LISTADO */}

        {!cargando && (
          <>
            <div className="cb-list-header">
              <div>
                <h2 className="cb-section-heading">
                  Cargos registrados
                </h2>

                <p className="cb-subtitle">
                  Revisa el estado y configuración de cada cargo.
                </p>
              </div>

              {cargos.length > 0 && (
                <span className="cb-badge">
                  {cargos.length}{' '}
                  {cargos.length === 1
                    ? 'cargo'
                    : 'cargos'}
                </span>
              )}
            </div>

            {cargos.length === 0 ? (
              <div className="cb-panel cb-empty">
                <div className="cb-empty-icon">
                  C
                </div>

                <h3>
                  No existen cargos registrados
                </h3>

                <p>
                  Crea el primer cargo utilizando
                  el formulario superior.
                </p>
              </div>
            ) : (
              <div className="cb-panel cb-table-scroll">
                <table className="cb-table">

                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Permite múltiples</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargos.map((cargo) => {
                      const procesando =
                        procesandoId === cargo.id

                      return (
                        <tr key={cargo.id}>

                          {/* NOMBRE */}

                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                              }}
                            >
                              <div className="cb-avatar">
                                {cargo.nombre
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span style={{ fontWeight: 700 }}>
                                {cargo.nombre}
                              </span>
                            </div>
                          </td>

                          {/* DESCRIPCION */}

                          <td>
                            <span className="cb-muted">
                              {cargo.descripcion ||
                                'Sin descripción'}
                            </span>
                          </td>

                          {/* MULTIPLES INTEGRANTES */}

                          <td>
                            <span
                              className={
                                cargo.permite_multiples
                                  ? 'cb-badge'
                                  : 'cb-badge cb-badge-muted'
                              }
                            >
                              {cargo.permite_multiples
                                ? 'Sí'
                                : 'No'}
                            </span>
                          </td>

                          {/* ESTADO */}

                          <td>
                            <span
                              className={
                                cargo.activo
                                  ? 'cb-badge cb-badge-green'
                                  : 'cb-badge cb-badge-muted'
                              }
                            >
                              {cargo.activo
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                          </td>

                          {/* ACCIONES */}

                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className={
                                cargo.activo
                                  ? 'cb-button cb-button-danger'
                                  : 'cb-button cb-button-success'
                              }
                              disabled={procesando}
                              onClick={() =>
                                void cambiarEstadoCargo(cargo)
                              }
                            >
                              {procesando
                                ? 'Procesando...'
                                : cargo.activo
                                  ? 'Desactivar'
                                  : 'Activar'}
                            </button>
                          </td>

                        </tr>
                      )
                    })}
                  </tbody>

                </table>
              </div>
            )}
          </>
        )}

      </section>
    </main>
  )
}

export default CargosPage
