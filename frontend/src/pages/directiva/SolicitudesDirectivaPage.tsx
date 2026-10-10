import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type EstadoSolicitud = 'PENDIENTE' | 'EN_PROCESO' | 'RESPONDIDA' | 'CERRADA'
type TipoSolicitud = 'CONSULTA' | 'RECLAMO' | 'SOLICITUD'

type Solicitud = {
  id: number
  vecino: number
  vecino_username: string
  junta_vecinos: number
  junta_nombre: string
  tipo: TipoSolicitud
  asunto: string
  descripcion: string
  estado: EstadoSolicitud
  respuesta: string
  respondido_por: number | null
  respondido_por_username: string | null
  fecha_respuesta: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

const API = 'http://localhost:8000/api/solicitudes/directiva/solicitudes/'

const estilos = `
.solicitudes-directiva-bosque {
  --sd-crema: #f6efd9;
  --sd-oro: #d7ac32;
  min-height: 100vh;
  color: var(--sd-crema);
  background: linear-gradient(120deg, rgba(4,23,16,.56), rgba(4,23,16,.72)), url('/solicitudes-directiva.webp') center / cover fixed no-repeat, #092318;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.solicitudes-directiva-bosque, .solicitudes-directiva-bosque * { box-sizing: border-box; }
.solicitudes-directiva-bosque .sd-card {
  background: rgba(8,29,19,.79);
  border: 1px solid rgba(215,172,50,.34);
  box-shadow: 0 12px 28px rgba(0,0,0,.24);
  backdrop-filter: blur(7px);
  border-radius: 20px;
}
.solicitudes-directiva-bosque h1, .solicitudes-directiva-bosque h2, .solicitudes-directiva-bosque h3 {
  font-family: Georgia, 'Times New Roman', serif;
  color: var(--sd-crema);
  font-weight: 700;
}
.solicitudes-directiva-bosque .sd-muted { color: #ccd3c7; }
.solicitudes-directiva-bosque .sd-label { color: #e8c967; font-weight: 650; }
.solicitudes-directiva-bosque .sd-badge {
  display: inline-flex; align-items:center; border:1px solid rgba(215,172,50,.52);
  border-radius:999px; background:rgba(215,172,50,.13); color:#f1d67e;
  padding: 5px 12px; font-size:12px; font-weight:700;
}
.solicitudes-directiva-bosque .sd-input {
  width:100%; background:rgba(4,22,14,.85); border:1px solid rgba(215,172,50,.43);
  color:#f6efd9; border-radius:12px; padding:12px 13px; outline-offset:3px;
}
.solicitudes-directiva-bosque .sd-input:focus-visible,
.solicitudes-directiva-bosque .sd-button:focus-visible,
.solicitudes-directiva-bosque a:focus-visible { outline:2px solid #edcc65; outline-offset:3px; }
.solicitudes-directiva-bosque .sd-input:disabled { opacity:.65; cursor:not-allowed; }
.solicitudes-directiva-bosque .sd-button {
  display:inline-flex; justify-content:center; align-items:center; gap:7px; padding:11px 18px;
  border-radius:12px; font-weight:750; text-decoration:none; transition:background .18s ease;
}
.solicitudes-directiva-bosque .sd-button-primary { background:linear-gradient(110deg,#e6c65c,#c49b2b); color:#122419; border:1px solid #d7ac32; }
.solicitudes-directiva-bosque .sd-button-secondary { background:rgba(215,172,50,.14); color:#f6e6b5; border:1px solid #d7ac32; }
.solicitudes-directiva-bosque .sd-button:not(:disabled):hover { background:#f0d67c; color:#102419; }
.solicitudes-directiva-bosque .sd-button:disabled { opacity:.5; cursor:not-allowed; }
.solicitudes-directiva-bosque .sd-subcard { background:rgba(3,20,12,.44); border:1px solid rgba(215,172,50,.19); border-radius:14px; }
.solicitudes-directiva-bosque .sd-alert-error { background:rgba(113,36,36,.85); border:1px solid #ca7777; color:#fff1ed; border-radius:12px; padding:14px 18px; }
.solicitudes-directiva-bosque .sd-alert-success { background:rgba(28,92,57,.83); border:1px solid #67a17d; color:#e3ffe7; border-radius:12px; padding:14px 18px; }
@media (max-width: 768px) { .solicitudes-directiva-bosque { background-attachment:scroll; } }
`

const formatearFecha = (fecha: string) => {
  const fechaObjeto = new Date(fecha)
  return Number.isNaN(fechaObjeto.getTime()) ? 'Sin fecha' : fechaObjeto.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

const nombreTipo: Record<TipoSolicitud, string> = {
  CONSULTA: 'Consulta', RECLAMO: 'Reclamo', SOLICITUD: 'Solicitud',
}
const nombreEstado: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESPONDIDA: 'Respondida', CERRADA: 'Cerrada',
}

function SolicitudesDirectivaPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorGuardar, setErrorGuardar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardandoId, setGuardandoId] = useState<number | null>(null)

  useEffect(() => {
    // Los cambios de estado ocurren al resolverse la petición, no sincrónicamente en el efecto.
    // Así evitamos la advertencia react-hooks/set-state-in-effect.
    const controller = new AbortController()
    const cargar = async () => {
      try {
        const response = await fetch(API, { credentials: 'include', signal: controller.signal })
        if (!response.ok) throw new Error('No fue posible cargar las solicitudes.')
        const data = (await response.json()) as Solicitud[]
        if (!controller.signal.aborted) setSolicitudes(data)
      } catch (err) {
        if (!controller.signal.aborted) {
          setErrorCarga(err instanceof Error ? err.message : 'Ocurrió un error al cargar las solicitudes.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }
    void cargar()
    return () => controller.abort()
  }, [])

  const actualizarCampo = (id: number, campo: 'estado' | 'respuesta', valor: string) => {
    setSolicitudes((actuales) => actuales.map((solicitud) =>
      solicitud.id === id ? { ...solicitud, [campo]: valor } : solicitud
    ))
  }

  const guardarSolicitud = async (solicitud: Solicitud) => {
    if (guardandoId !== null) return
    try {
      setGuardandoId(solicitud.id)
      setErrorGuardar('')
      setMensaje('')
      const response = await fetch(`${API}${solicitud.id}/`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: solicitud.estado, respuesta: solicitud.respuesta }),
      })
      const data = await response.json()
      if (!response.ok) {
        const detalle = data.respuesta?.[0] || data.detail || 'No fue posible guardar los cambios.'
        throw new Error(typeof detalle === 'string' ? detalle : 'No fue posible guardar los cambios.')
      }
      setSolicitudes((actuales) => actuales.map((item) => item.id === data.id ? data as Solicitud : item))
      setMensaje(`Cambios de la solicitud #${solicitud.id} guardados correctamente.`)
    } catch (err) {
      setErrorGuardar(err instanceof Error ? err.message : 'Ocurrió un error al guardar la solicitud.')
    } finally {
      setGuardandoId(null)
    }
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length
  const enProceso = solicitudes.filter((s) => s.estado === 'EN_PROCESO').length
  const respondidas = solicitudes.filter((s) => s.estado === 'RESPONDIDA').length
  const cerradas = solicitudes.filter((s) => s.estado === 'CERRADA').length
  const resumen = [
    { etiqueta: 'Pendientes', valor: pendientes, descripcion: 'Por atender' },
    { etiqueta: 'En proceso', valor: enProceso, descripcion: 'Gestionando' },
    { etiqueta: 'Respondidas', valor: respondidas, descripcion: 'Contestadas' },
    { etiqueta: 'Cerradas', valor: cerradas, descripcion: 'Finalizadas' },
  ]

  return (
    <main className="solicitudes-directiva-bosque px-4 py-8 sm:px-6">
      <style>{estilos}</style>
      <section className="mx-auto w-full max-w-7xl">
        <header className="sd-card mb-6 flex flex-wrap items-start justify-between gap-5 p-6 sm:p-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl">Solicitudes de Vecinos</h1>
              <span className="sd-badge">Directiva</span>
            </div>
            <p className="sd-muted max-w-2xl">Revisa y responde las consultas, reclamos y solicitudes enviadas por los vecinos de tu junta.</p>
          </div>
          <Link to="/directiva" className="sd-button sd-button-secondary">← Volver al Panel</Link>
        </header>

        {cargando && <div className="sd-card mb-6 p-5" role="status">Cargando solicitudes de vecinos...</div>}
        {errorCarga && <div className="sd-alert-error mb-6" role="alert">{errorCarga}</div>}
        {errorGuardar && <div className="sd-alert-error mb-6" role="alert">{errorGuardar}</div>}
        {mensaje && <div className="sd-alert-success mb-6" role="status">{mensaje}</div>}

        {!cargando && (
          <>
            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resumen.map((item) => (
                <div key={item.etiqueta} className="sd-card p-5">
                  <p className="sd-muted text-sm">{item.etiqueta}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <strong className="text-3xl" style={{color:'#e9ca6c'}}>{errorCarga ? '—' : item.valor}</strong>
                    <span className="sd-badge">{item.descripcion}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl">Solicitudes recibidas</h2>
                <p className="sd-muted mt-2">Gestiona el estado y la respuesta de cada solicitud.</p>
              </div>
              {!errorCarga && <span className="sd-badge">{solicitudes.length} {solicitudes.length === 1 ? 'registro' : 'registros'}</span>}
            </div>

            {errorCarga ? (
              <div className="sd-card p-8 text-center">
                <h3 className="text-xl">Solicitudes no disponibles</h3>
                <p className="sd-muted mt-3">No fue posible consultar los registros. El panel permanece visible; no se pueden gestionar solicitudes sin datos del servidor.</p>
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="sd-card p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{background:'rgba(215,172,50,.15)',color:'#e9ca6c',fontSize:26}}>✓</div>
                <h3 className="text-xl">No hay solicitudes por gestionar</h3>
                <p className="sd-muted mx-auto mt-3 max-w-lg">Actualmente no existen consultas, reclamos o solicitudes enviadas por los vecinos.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {solicitudes.map((solicitud) => (
                  <article key={solicitud.id} className="sd-card overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5 sm:p-6" style={{borderColor:'rgba(215,172,50,.23)'}}>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="sd-badge">{nombreTipo[solicitud.tipo]}</span>
                          <span className="sd-badge">{nombreEstado[solicitud.estado]}</span>
                          <span className="sd-badge">#{solicitud.id}</span>
                        </div>
                        <h3 className="break-words text-xl">{solicitud.asunto}</h3>
                        <div className="sd-muted mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <span>Vecino: <strong className="text-white">{solicitud.vecino_username}</strong></span>
                          <span>Junta: <strong className="text-white">{solicitud.junta_nombre}</strong></span>
                        </div>
                      </div>
                      <div className="sd-muted text-sm"><span className="sd-label">Recibida</span><br />{formatearFecha(solicitud.fecha_creacion)}</div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="sd-label mb-2 text-sm uppercase tracking-wider">Mensaje del vecino</p>
                      <div className="sd-subcard mb-6 p-5"><p className="whitespace-pre-wrap leading-relaxed">{solicitud.descripcion}</p></div>
                      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                        <label className="block">
                          <span className="sd-label mb-2 block">Estado</span>
                          <select className="sd-input" value={solicitud.estado} disabled={guardandoId !== null}
                            onChange={(e) => actualizarCampo(solicitud.id, 'estado', e.target.value)}>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN_PROCESO">En proceso</option>
                            <option value="RESPONDIDA">Respondida</option>
                            <option value="CERRADA">Cerrada</option>
                          </select>
                          <span className="sd-muted mt-2 block text-xs">Actualiza el avance de la gestión.</span>
                        </label>
                        <label className="block">
                          <span className="sd-label mb-2 block">Respuesta al vecino</span>
                          <textarea className="sd-input min-h-32 resize-y" placeholder="Escribe la respuesta para el vecino..."
                            value={solicitud.respuesta ?? ''} disabled={guardandoId !== null}
                            onChange={(e) => actualizarCampo(solicitud.id, 'respuesta', e.target.value)} />
                          <span className="sd-muted mt-2 block text-right text-xs">{(solicitud.respuesta ?? '').length} caracteres</span>
                        </label>
                      </div>
                      {solicitud.respondido_por_username && (
                        <div className="sd-subcard mt-5 p-4 text-sm">
                          <span className="sd-badge">Respondida</span>
                          <span className="sd-muted ml-2">por </span><strong>{solicitud.respondido_por_username}</strong>
                          {solicitud.fecha_respuesta && <span className="sd-muted ml-2">el {formatearFecha(solicitud.fecha_respuesta)}</span>}
                        </div>
                      )}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5" style={{borderColor:'rgba(215,172,50,.23)'}}>
                        <p className="sd-muted text-xs">Última actualización: {formatearFecha(solicitud.fecha_actualizacion)}</p>
                        <button type="button" className="sd-button sd-button-primary" disabled={guardandoId !== null}
                          onClick={() => { void guardarSolicitud(solicitud) }}>
                          {guardandoId === solicitud.id ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default SolicitudesDirectivaPage
