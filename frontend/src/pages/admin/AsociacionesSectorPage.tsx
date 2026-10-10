
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type AsociacionPendiente = {
  id: number
  username: string
  rut: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  email: string
  sector_id: number
  sector_nombre: string
  junta_id: number
  junta_nombre: string
  estado_asociacion_sector: string
}

function AsociacionesSectorPage() {
  const [asociaciones, setAsociaciones] =
    useState<AsociacionPendiente[]>([])

  const [cargando, setCargando] = useState(true)

  const [procesandoId, setProcesandoId] =
    useState<number | null>(null)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  /*
   * CARGAR ASOCIACIONES
   *
   * Corrección del error:
   * react-hooks/set-state-in-effect
   *
   * La carga se ejecuta dentro del efecto
   * y las actualizaciones de estado se
   * realizan después de la petición.
   */

  useEffect(() => {
    let cancelado = false

    const cargarAsociaciones = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/organizacion/asociaciones-pendientes/',
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible cargar las asociaciones pendientes.'
          )
        }

        const data =
          (await response.json()) as AsociacionPendiente[]

        if (!cancelado) {
          setAsociaciones(data)
          setError('')
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'No fue posible comunicarse con el servidor.'
          )
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargarAsociaciones()

    return () => {
      cancelado = true
    }
  }, [])

  /*
   * CONFIRMAR O RECHAZAR ASOCIACIÓN
   */

  const resolverAsociacion = async (
    usuarioId: number,
    accion: 'CONFIRMAR' | 'RECHAZAR'
  ) => {
    setError('')
    setMensaje('')
    setProcesandoId(usuarioId)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/resolver-asociacion-sector/${usuarioId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            accion,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
            'No fue posible resolver la asociación.'
        )
        return
      }

      setAsociaciones((actuales) =>
        actuales.filter(
          (asociacion) =>
            asociacion.id !== usuarioId
        )
      )

      setMensaje(
        accion === 'CONFIRMAR'
          ? 'Asociación confirmada correctamente.'
          : 'Asociación rechazada correctamente.'
      )
    } catch {
      setError(
        'No fue posible comunicarse con el servidor.'
      )
    } finally {
      setProcesandoId(null)
    }
  }

  /*
   * OBTENER NOMBRE COMPLETO
   */

  const obtenerNombreCompleto = (
    asociacion: AsociacionPendiente
  ) => {
    return (
      [
        asociacion.nombres,
        asociacion.apellido_paterno,
        asociacion.apellido_materno,
      ]
        .filter(Boolean)
        .join(' ') || asociacion.username
    )
  }

  /*
   * OBTENER INICIALES
   */

  const obtenerIniciales = (
    asociacion: AsociacionPendiente
  ) => {
    const nombre = obtenerNombreCompleto(asociacion)

    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) =>
        parte.charAt(0).toUpperCase()
      )
      .join('')
  }

  return (
    <main className="asociaciones-bosque">
      <style>{`

        /* ===================================
           TEMA BOSQUE - ASOCIACIONES
           =================================== */

        .asociaciones-bosque {
          --ab-oro: #d7ac32;
          --ab-oro-claro: #f0d375;
          --ab-crema: #f6efd9;
          --ab-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 16px;

          color: var(--ab-crema);
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #092318;

          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/junta-v.jpg');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .asociaciones-bosque,
        .asociaciones-bosque * {
          box-sizing: border-box;
        }

        .asociaciones-bosque .ab-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* ===================================
           PANELES
           =================================== */

        .asociaciones-bosque .ab-panel {
          background: rgba(8, 29, 19, 0.77);

          border: 1px solid rgba(215, 172, 50, 0.30);
          border-radius: 23px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.16);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* ===================================
           TITULOS
           =================================== */

        .asociaciones-bosque h1,
        .asociaciones-bosque h2,
        .asociaciones-bosque h3 {
          font-family:
            Georgia, 'Times New Roman', serif;

          color: var(--ab-crema);
          line-height: 1.2;
        }

        .asociaciones-bosque .ab-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .asociaciones-bosque .ab-header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .asociaciones-bosque .ab-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .asociaciones-bosque .ab-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }

        .asociaciones-bosque .ab-subtitle {
          margin: 0;
          max-width: 800px;

          color: var(--ab-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        /* ===================================
           ETIQUETAS
           =================================== */

        .asociaciones-bosque .ab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 6px 15px;

          border: 1px solid rgba(215,172,50,0.48);
          border-radius: 999px;

          background: rgba(215,172,50,0.13);
          color: #e9c454;

          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
        }

        .asociaciones-bosque .ab-badge-green {
          color: #a6eac4;

          border-color: rgba(80,183,125,0.5);
          background: rgba(28,125,78,0.20);
        }

        .asociaciones-bosque .ab-badge-muted {
          color: #e6e9df;

          border-color: rgba(220,220,200,0.25);
          background: rgba(230,230,210,0.08);
        }

        /* ===================================
           BOTONES GENERALES
           =================================== */

        .asociaciones-bosque .ab-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 45px;
          padding: 12px 22px;

          border: 1px solid rgba(215,172,50,0.65);
          border-radius: 15px;

          background: rgba(7,26,17,0.60);
          color: var(--ab-crema);

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

        .asociaciones-bosque .ab-button:hover {
          background: rgba(215,172,50,0.20);
          border-color: #e9c454;
          color: #fff7de;
        }

        /* ===================================
           BOTON CONFIRMAR
           =================================== */

        .asociaciones-bosque .ab-confirmar {
          background:
            linear-gradient(115deg, #e4c55b, #c49a28);

          border-color: #d7ac32;
          color: #102419;
          font-weight: 750;
        }

        .asociaciones-bosque .ab-confirmar:hover {
          background:
            linear-gradient(115deg, #f0d67c, #dfb646);

          border-color: #e9c454;
          color: #102419;

          transform: translateY(-1px);
        }

        /* ===================================
           BOTON RECHAZAR
           =================================== */

        .asociaciones-bosque .ab-rechazar {
          background: rgba(128, 37, 40, 0.24);

          border-color: rgba(225, 110, 110, 0.70);
          color: #ffc2bf;
        }

        .asociaciones-bosque .ab-rechazar:hover {
          background: rgba(165, 50, 52, 0.55);

          border-color: #ef9c98;
          color: #fff0ee;
        }

        .asociaciones-bosque .ab-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* ===================================
           ESTADISTICAS
           =================================== */

        .asociaciones-bosque .ab-stats {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 20px;
          margin-bottom: 28px;
        }

        .asociaciones-bosque .ab-stat {
          padding: 23px 25px;

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .asociaciones-bosque .ab-stat:hover {
          transform: translateY(-3px);

          background: rgba(12,43,26,0.85);
        }

        .asociaciones-bosque .ab-stat-label {
          margin: 0 0 15px;

          color: #d1d6c7;
          font-size: 15px;
          font-weight: 600;
        }

        .asociaciones-bosque .ab-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .asociaciones-bosque .ab-stat-number {
          color: var(--ab-oro);

          font-size: 35px;
          line-height: 1;
          font-weight: 800;
        }

        .asociaciones-bosque .ab-stat-text {
          color: var(--ab-crema);

          font-size: 21px;
          font-weight: 750;
          line-height: 1.3;
        }

        /* ===================================
           ALERTAS
           =================================== */

        .asociaciones-bosque .ab-alert {
          padding: 15px 19px;
          margin-bottom: 24px;

          border-radius: 13px;
          font-size: 15px;
        }

        .asociaciones-bosque .ab-alert-error {
          background: rgba(118,33,35,0.84);

          border: 1px solid rgba(231,104,104,0.5);
          color: #ffe4e4;
        }

        .asociaciones-bosque .ab-alert-success {
          background: rgba(18,93,57,0.8);

          border: 1px solid rgba(102,201,140,0.45);
          color: #dbffe6;
        }

        /* ===================================
           SECCION SOLICITUDES
           =================================== */

        .asociaciones-bosque .ab-list-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;

          margin-bottom: 18px;
        }

        .asociaciones-bosque .ab-section-heading {
          margin: 0 0 12px;
          font-size: 30px;
        }

        /* ===================================
           ESTADO VACIO
           =================================== */

        .asociaciones-bosque .ab-empty {
          padding: 60px 25px;
          text-align: center;
        }

        .asociaciones-bosque .ab-empty-icon {
          display: grid;
          place-items: center;

          width: 68px;
          height: 68px;

          margin: 0 auto 20px;

          border-radius: 50%;

          background: rgba(215,172,50,0.16);
          color: #e9c454;

          font-size: 28px;
          font-weight: 800;
        }

        .asociaciones-bosque .ab-empty h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .asociaciones-bosque .ab-empty p {
          max-width: 470px;
          margin: 0 auto;

          color: #cbd2c4;
          line-height: 1.7;
        }

        /* ===================================
           TABLA
           =================================== */

        .asociaciones-bosque .ab-table-scroll {
          overflow-x: auto;
          border-radius: 23px;
        }

        .asociaciones-bosque .ab-table {
          width: 100%;
          border-collapse: collapse;

          color: #f1eddf;
          font-size: 14px;
        }

        .asociaciones-bosque .ab-table thead {
          background: rgba(215,172,50,0.13);
        }

        .asociaciones-bosque .ab-table th {
          padding: 18px;

          color: #ebce70;
          text-align: left;
          font-weight: 700;

          white-space: nowrap;
        }

        .asociaciones-bosque .ab-table td {
          padding: 18px;

          border-top:
            1px solid rgba(215,172,50,0.15);

          vertical-align: middle;
        }

        .asociaciones-bosque .ab-table tbody tr:hover {
          background: rgba(215,172,50,0.07);
        }

        /* ===================================
           AVATAR
           =================================== */

        .asociaciones-bosque .ab-avatar {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 43px;
          height: 43px;

          border-radius: 50%;

          background: rgba(215,172,50,0.17);
          color: #e9c454;

          font-size: 16px;
          font-weight: 800;
        }

        .asociaciones-bosque .ab-muted {
          color: #bfcbbe;
        }

        /* ===================================
           CARGANDO
           =================================== */

        .asociaciones-bosque .ab-loading {
          padding: 45px;
          text-align: center;
          color: #ebce70;
        }

        /* ===================================
           ACCIONES DE TABLA
           =================================== */

        .asociaciones-bosque .ab-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          min-width: 200px;
        }

        .asociaciones-bosque .ab-actions .ab-button {
          min-height: 39px;
          padding: 9px 14px;
          font-size: 13px;
        }

        /* ===================================
           ACCESIBILIDAD
           =================================== */

        .asociaciones-bosque button:focus-visible,
        .asociaciones-bosque a:focus-visible {
          outline: 2px solid #e8c657;
          outline-offset: 3px;
        }

        /* ===================================
           RESPONSIVE
           =================================== */

        @media (max-width: 1050px) {
          .asociaciones-bosque .ab-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .asociaciones-bosque .ab-stat:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .asociaciones-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .asociaciones-bosque .ab-header {
            padding: 22px;
          }

          .asociaciones-bosque .ab-stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .asociaciones-bosque .ab-stat {
            padding: 18px;
          }

          .asociaciones-bosque .ab-stat:last-child {
            grid-column: auto;
          }

          .asociaciones-bosque .ab-stat-number {
            font-size: 30px;
          }

          .asociaciones-bosque .ab-actions {
            min-width: 0;
            flex-wrap: wrap;
          }
        }

      `}</style>

      <section className="ab-container">

        {/* ===================================
            ENCABEZADO
            =================================== */}

        <div className="ab-panel ab-header">
          <div className="ab-header-row">
            <div>
              <div className="ab-title-row">
                <h1 className="ab-title">
                  Asociaciones Territoriales
                </h1>

                <span className="ab-badge">
                  Administración
                </span>
              </div>

              <p className="ab-subtitle">
                Revisa las solicitudes de asociación territorial
                realizadas por los vecinos y confirma o rechaza
                su pertenencia a un sector.
              </p>
            </div>

            <Link
              to="/admin"
              className="ab-button"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* ===================================
            RESUMEN
            =================================== */}

        {!cargando && (
          <div className="ab-stats">

            {/* SOLICITUDES PENDIENTES */}

            <div className="ab-panel ab-stat">
              <p className="ab-stat-label">
                Solicitudes pendientes
              </p>

              <div className="ab-stat-bottom">
                <span className="ab-stat-number">
                  {asociaciones.length}
                </span>

                <span className="ab-badge">
                  Por revisar
                </span>
              </div>
            </div>

            {/* TIPO DE GESTION */}

            <div className="ab-panel ab-stat">
              <p className="ab-stat-label">
                Tipo de gestión
              </p>

              <div className="ab-stat-bottom">
                <span className="ab-stat-text">
                  Territorial
                </span>

                <span className="ab-badge">
                  Sectores
                </span>
              </div>
            </div>

            {/* ESTADO */}

            <div className="ab-panel ab-stat">
              <p className="ab-stat-label">
                Estado
              </p>

              <div className="ab-stat-bottom">
                <span className="ab-stat-text">
                  Gestión activa
                </span>

                <span className="ab-badge ab-badge-green">
                  Disponible
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ===================================
            MENSAJES
            =================================== */}

        {error && (
          <div
            className="ab-alert ab-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            className="ab-alert ab-alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {/* ===================================
            INDICADOR DE CARGA
            =================================== */}

        {cargando && (
          <div className="ab-panel ab-loading">
            <span
              className="loading loading-spinner loading-lg"
            />

            <p style={{ marginTop: 16 }}>
              Cargando asociaciones pendientes...
            </p>
          </div>
        )}

        {/* ===================================
            SOLICITUDES
            =================================== */}

        {!cargando && (
          <>
            <div className="ab-list-header">
              <div>
                <h2 className="ab-section-heading">
                  Solicitudes pendientes
                </h2>

                <p className="ab-subtitle">
                  Verifica los datos del vecino antes de
                  resolver la solicitud.
                </p>
              </div>

              {asociaciones.length > 0 && (
                <span className="ab-badge">
                  {asociaciones.length}{' '}
                  {asociaciones.length === 1
                    ? 'solicitud'
                    : 'solicitudes'}
                </span>
              )}
            </div>

            {/* SIN ASOCIACIONES */}

            {asociaciones.length === 0 ? (
              <div className="ab-panel ab-empty">

                <div className="ab-empty-icon">
                  ✓
                </div>

                <h3>
                  {error
                    ? 'No se pudieron consultar las asociaciones'
                    : 'No existen asociaciones pendientes'}
                </h3>

                <p>
                  {error
                    ? 'No fue posible verificar las solicitudes pendientes. Revisa la conexión e intenta nuevamente.'
                    : 'Todas las solicitudes territoriales se encuentran resueltas por el momento.'}
                </p>
              </div>

            ) : (

              /* TABLA DE ASOCIACIONES */

              <div className="ab-panel ab-table-scroll">
                <table className="ab-table">

                  <thead>
                    <tr>
                      <th>Vecino</th>
                      <th>RUT</th>
                      <th>Correo</th>
                      <th>Junta</th>
                      <th>Sector</th>
                      <th style={{ textAlign: 'right' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {asociaciones.map((asociacion) => {
                      const nombreCompleto =
                        obtenerNombreCompleto(asociacion)

                      const procesando =
                        procesandoId === asociacion.id

                      return (
                        <tr key={asociacion.id}>

                          {/* VECINO */}

                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                minWidth: 190,
                              }}
                            >
                              <div className="ab-avatar">
                                {obtenerIniciales(asociacion)}
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                  }}
                                >
                                  {nombreCompleto}
                                </div>

                                <div
                                  className="ab-muted"
                                  style={{
                                    fontSize: 12,
                                    marginTop: 4,
                                  }}
                                >
                                  @{asociacion.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* RUT */}

                          <td>
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {asociacion.rut ?? '-'}
                            </span>
                          </td>

                          {/* CORREO */}

                          <td>
                            <span
                              style={{
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {asociacion.email}
                            </span>
                          </td>

                          {/* JUNTA */}

                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                              }}
                            >
                              {asociacion.junta_nombre}
                            </span>
                          </td>

                          {/* SECTOR */}

                          <td>
                            <span className="ab-badge">
                              {asociacion.sector_nombre}
                            </span>
                          </td>

                          {/* ACCIONES */}

                          <td>
                            <div className="ab-actions">

                              {/* CONFIRMAR */}

                              <button
                                type="button"
                                className="ab-button ab-confirmar"
                                disabled={procesandoId !== null}
                                onClick={() =>
                                  void resolverAsociacion(
                                    asociacion.id,
                                    'CONFIRMAR'
                                  )
                                }
                              >
                                {procesando
                                  ? 'Procesando...'
                                  : 'Confirmar'}
                              </button>

                              {/* RECHAZAR */}

                              <button
                                type="button"
                                className="ab-button ab-rechazar"
                                disabled={procesandoId !== null}
                                onClick={() =>
                                  void resolverAsociacion(
                                    asociacion.id,
                                    'RECHAZAR'
                                  )
                                }
                              >
                                Rechazar
                              </button>

                            </div>
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

export default AsociacionesSectorPage
