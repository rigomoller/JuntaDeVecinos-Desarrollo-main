import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

type Evento = {
  id: number
  directiva: number
  junta_nombre: string
  creador: number
  creador_username: string
  titulo: string
  descripcion: string
  lugar: string
  fecha_inicio: string
  fecha_fin: string | null
  cupo_maximo: number | null
  estado: 'PROGRAMADO' | 'CANCELADO' | 'FINALIZADO'
  fecha_creacion: string
  fecha_actualizacion: string
}

type IntegranteDirectiva = {
  id: number
  directiva: number
  activo: boolean
}

type TipoMensaje = 'success' | 'error' | ''

const API = 'http://localhost:8000'

function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoDirectiva, setCargandoDirectiva] = useState(true)
  const [error, setError] = useState('')
  const [errorDirectiva, setErrorDirectiva] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [lugar, setLugar] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cupoMaximo, setCupoMaximo] = useState('')
  const [directivaId, setDirectivaId] = useState<number | null>(null)
  const [creando, setCreando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>('')
  const [eventoACancelar, setEventoACancelar] = useState<Evento | null>(null)
  const [eventoAEditar, setEventoAEditar] = useState<Evento | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const cargarEventos = async () => {
      try {
        const response = await fetch(`${API}/api/eventos/eventos/`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('No fue posible cargar los eventos.')
        const data = (await response.json()) as Evento[]
        if (!controller.signal.aborted) {
          setEventos(data)
          setError('')
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }
    void cargarEventos()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const cargarDirectivaActiva = async () => {
      try {
        const response = await fetch(`${API}/api/organizacion/integrantes-directiva/`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('No fue posible obtener la directiva activa.')
        const data = (await response.json()) as IntegranteDirectiva[]
        const integranteActivo = data.find((integrante) => integrante.activo)
        if (!controller.signal.aborted) {
          setDirectivaId(integranteActivo?.directiva ?? null)
          setErrorDirectiva(integranteActivo ? '' : 'No se encontró una directiva vigente asociada al usuario.')
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setErrorDirectiva(err instanceof Error ? err.message : 'No fue posible consultar la directiva.')
        }
      } finally {
        if (!controller.signal.aborted) setCargandoDirectiva(false)
      }
    }
    void cargarDirectivaActiva()
    return () => controller.abort()
  }, [])

  const habilitado = !cargandoDirectiva && directivaId !== null

  const limpiarFormulario = () => {
    setTitulo('')
    setDescripcion('')
    setLugar('')
    setFechaInicio('')
    setFechaFin('')
    setCupoMaximo('')
    setEventoAEditar(null)
  }

  const crearEvento = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!habilitado || directivaId === null) {
      setMensaje('Se requiere una directiva vigente para guardar un evento.')
      setTipoMensaje('error')
      return
    }
    try {
      setCreando(true)
      setMensaje('')
      setTipoMensaje('')
      const url = eventoAEditar
        ? `${API}/api/eventos/eventos/${eventoAEditar.id}/`
        : `${API}/api/eventos/eventos/`
      const response = await fetch(url, {
        method: eventoAEditar ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directiva: directivaId,
          titulo,
          descripcion,
          lugar,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin || null,
          cupo_maximo: cupoMaximo !== '' ? Number(cupoMaximo) : null,
          estado: 'PROGRAMADO',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'No fue posible guardar el evento.')
      const guardado = data as Evento
      if (eventoAEditar) {
        setEventos((actuales) => actuales.map((item) => item.id === guardado.id ? guardado : item))
        setMensaje('Evento actualizado correctamente.')
      } else {
        setEventos((actuales) => [...actuales, guardado])
        setMensaje('Evento creado correctamente.')
      }
      setTipoMensaje('success')
      limpiarFormulario()
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
      setTipoMensaje('error')
    } finally {
      setCreando(false)
    }
  }

  const cancelarEvento = async (eventoId: number) => {
    if (!habilitado) return
    try {
      setCancelando(true)
      setMensaje('')
      setTipoMensaje('')
      const response = await fetch(`${API}/api/eventos/eventos/${eventoId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'CANCELADO' }),
      })
      if (!response.ok) throw new Error('No fue posible cancelar el evento.')
      const actualizado = (await response.json()) as Evento
      setEventos((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item))
      setMensaje('Evento cancelado correctamente.')
      setTipoMensaje('success')
      setEventoACancelar(null)
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
      setTipoMensaje('error')
    } finally {
      setCancelando(false)
    }
  }

  const prepararEdicion = (evento: Evento) => {
    if (!habilitado) return
    setEventoAEditar(evento)
    setTitulo(evento.titulo)
    setDescripcion(evento.descripcion)
    setLugar(evento.lugar)
    setFechaInicio(evento.fecha_inicio.slice(0, 16))
    setFechaFin(evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '')
    setCupoMaximo(evento.cupo_maximo !== null ? String(evento.cupo_maximo) : '')
    setMensaje('')
    setTipoMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    limpiarFormulario()
    setMensaje('')
    setTipoMensaje('')
  }

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })

  const etiquetaEstado = (estado: Evento['estado']) =>
    estado === 'PROGRAMADO' ? 'Programado' : estado === 'CANCELADO' ? 'Cancelado' : 'Finalizado'

  const totalProgramados = eventos.filter((e) => e.estado === 'PROGRAMADO').length
  const totalFinalizados = eventos.filter((e) => e.estado === 'FINALIZADO').length
  const totalCancelados = eventos.filter((e) => e.estado === 'CANCELADO').length

  return (
    <main className="eventos-bosque">
      <style>{`
        .eventos-bosque {
          --ev-oro: #d7ac32;
          --ev-crema: #f6efd9;
          --ev-suave: #cbd2c4;
          min-height: 100vh;
          padding: 32px 20px;
          color: var(--ev-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #092318;
          background-image: linear-gradient(120deg, rgba(4,23,16,.35), rgba(4,23,16,.48)), url('/eventos-directiva.webp');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }
        .eventos-bosque, .eventos-bosque * { box-sizing: border-box; }
        .eventos-bosque .ev-container { max-width: 1450px; margin: 0 auto; }
        .eventos-bosque .ev-panel {
          background: rgba(8,29,19,.75);
          border: 1px solid rgba(215,172,50,.34);
          border-radius: 21px;
          box-shadow: 0 12px 32px rgba(0,0,0,.20);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        .eventos-bosque h1, .eventos-bosque h2, .eventos-bosque h3 {
          color: #f6efd9; font-family: Georgia, 'Times New Roman', serif; line-height: 1.25;
        }
        .eventos-bosque h1 { font-size: clamp(30px,3vw,42px); margin: 0; }
        .eventos-bosque h2 { font-size: 27px; margin: 0 0 8px; }
        .eventos-bosque h3 { font-size: 22px; margin: 0; }
        .eventos-bosque .ev-subtitle { color: var(--ev-suave); line-height: 1.7; margin: 8px 0 0; }
        .eventos-bosque .ev-header { padding: 30px; margin-bottom: 24px; }
        .eventos-bosque .ev-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 18px; }
        .eventos-bosque .ev-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 13px; margin-bottom: 9px; }
        .eventos-bosque .ev-badge {
          display: inline-flex; align-items: center; border-radius: 999px;
          background: rgba(215,172,50,.15); border: 1px solid rgba(215,172,50,.5);
          color: #f0d375; padding: 6px 14px; font-size: 12px; font-weight: 750;
        }
        .eventos-bosque .ev-badge-programado { color: #b9e6f4; background: rgba(33,95,120,.26); border-color: rgba(110,175,199,.55); }
        .eventos-bosque .ev-badge-finalizado { color: #afe9c3; background: rgba(24,110,65,.26); border-color: rgba(76,170,109,.6); }
        .eventos-bosque .ev-badge-cancelado { color: #ffc6c6; background: rgba(132,40,48,.3); border-color: rgba(229,115,115,.6); }
        .eventos-bosque .ev-button {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 44px; padding: 11px 18px; border: 1px solid #d7ac32;
          border-radius: 12px; font: inherit; font-size: 14px; font-weight: 750;
          background: rgba(215,172,50,.17); color: #f6e6b5; text-decoration: none; cursor: pointer;
          transition: background .2s ease, transform .2s ease;
        }
        .eventos-bosque .ev-button:hover:not(:disabled) { background: #d7ac32; color: #102419; transform: translateY(-2px); }
        .eventos-bosque .ev-button-primary { color: #102419; background: linear-gradient(115deg,#e4c55b,#c49a28); }
        .eventos-bosque .ev-button-primary:hover:not(:disabled) { background: #f0d67c; }
        .eventos-bosque .ev-button-danger { border-color: #dd9797; color: #ffcccc; background: rgba(124,35,43,.24); }
        .eventos-bosque .ev-button-danger:hover:not(:disabled) { background: #b95353; color: #fff; }
        .eventos-bosque .ev-button:disabled { opacity: .5; cursor: not-allowed; }
        .eventos-bosque .ev-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 17px; margin-bottom: 24px; }
        .eventos-bosque .ev-stat { padding: 23px; }
        .eventos-bosque .ev-stat-title { color: #cbd2c4; font-weight: 600; font-size: 14px; margin: 0 0 14px; }
        .eventos-bosque .ev-stat-value { color: #e4c55b; font-size: 35px; font-weight: 800; line-height: 1.2; }
        .eventos-bosque .ev-stat-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
        .eventos-bosque .ev-alert { padding: 17px 20px; margin-bottom: 22px; border-radius: 14px; line-height: 1.6; }
        .eventos-bosque .ev-alert-error { color: #ffe4e4; background: rgba(118,33,35,.85); border: 1px solid rgba(231,104,104,.55); }
        .eventos-bosque .ev-alert-pending { color: #f6efd9; background: rgba(50,45,20,.84); border: 1px solid rgba(215,172,50,.48); }
        .eventos-bosque .ev-alert-success { color: #dffbe8; background: rgba(25,88,54,.86); border: 1px solid rgba(93,183,117,.55); }
        .eventos-bosque .ev-form { overflow: hidden; margin-bottom: 28px; }
        .eventos-bosque .ev-form-header { padding: 25px 28px; border-bottom: 1px solid rgba(215,172,50,.22); }
        .eventos-bosque .ev-form-body { padding: 28px; }
        .eventos-bosque .ev-fields { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 19px; }
        .eventos-bosque .ev-field { display: flex; flex-direction: column; min-width: 0; gap: 9px; }
        .eventos-bosque .ev-field-wide { grid-column: 1 / -1; }
        .eventos-bosque .ev-field-label { font-weight: 700; font-size: 14px; color: #f6efd9; }
        .eventos-bosque .ev-field-hint { font-size: 12px; color: #cbd2c4; }
        .eventos-bosque .ev-input {
          display: block; width: 100%; min-height: 48px; padding: 12px 14px;
          border-radius: 12px; border: 1px solid rgba(215,172,50,.43);
          background: rgba(5,25,16,.87); color: #f6efd9;
          font: inherit; font-size: 14px; color-scheme: dark;
        }
        .eventos-bosque .ev-input::placeholder { color: #bac6b8; }
        .eventos-bosque .ev-input:focus { outline: 2px solid rgba(215,172,50,.6); outline-offset: 1px; }
        .eventos-bosque textarea.ev-input { min-height: 125px; resize: vertical; }
        .eventos-bosque .ev-input:disabled { opacity: .62; cursor: not-allowed; }
        .eventos-bosque .ev-form-actions { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; padding-top: 23px; margin-top: 24px; border-top: 1px solid rgba(215,172,50,.24); }
        .eventos-bosque .ev-list-heading { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
        .eventos-bosque .ev-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
        .eventos-bosque .ev-card { display: flex; flex-direction: column; overflow: hidden; }
        .eventos-bosque .ev-card-content { flex: 1; padding: 25px; }
        .eventos-bosque .ev-card-title { display: flex; justify-content: space-between; gap: 15px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 15px; }
        .eventos-bosque .ev-card-desc { color: #d2dccd; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
        .eventos-bosque .ev-data-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; margin-top: 19px; }
        .eventos-bosque .ev-data-box { padding: 15px; border: 1px solid rgba(215,172,50,.19); border-radius: 12px; background: rgba(3,20,12,.42); }
        .eventos-bosque .ev-data-label { margin: 0 0 7px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #b8c7b6; font-weight: 700; }
        .eventos-bosque .ev-data-value { margin: 0; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
        .eventos-bosque .ev-meta { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 18px; font-size: 12px; color: #cbd2c4; }
        .eventos-bosque .ev-card-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 9px; padding: 18px 25px; border-top: 1px solid rgba(215,172,50,.2); }
        .eventos-bosque .ev-empty { text-align: center; padding: 46px 25px; }
        .eventos-bosque .ev-dialog { position: fixed; inset: 0; z-index: 50; width: 100vw; height: 100vh; background: rgba(0,0,0,.64); border: 0; max-width: none; max-height: none; padding: 16px; display: flex; justify-content: center; align-items: center; }
        .eventos-bosque .ev-dialog-panel { width: min(100%,520px); padding: 28px; }
        .eventos-bosque .ev-dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
        .eventos-bosque a:focus-visible, .eventos-bosque button:focus-visible { outline: 2px solid #f0d375; outline-offset: 3px; }
        @media(max-width:1000px) { .eventos-bosque .ev-stats { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media(max-width:760px) {
          .eventos-bosque { padding: 18px 12px; background-attachment: scroll; }
          .eventos-bosque .ev-fields, .eventos-bosque .ev-grid { grid-template-columns: 1fr; }
          .eventos-bosque .ev-field-wide { grid-column: auto; }
          .eventos-bosque .ev-header, .eventos-bosque .ev-form-header, .eventos-bosque .ev-form-body { padding: 21px; }
        }
      `}</style>

      <section className="ev-container">
        <header className="ev-panel ev-header">
          <div className="ev-row">
            <div>
              <div className="ev-title-row">
                <h1>Actividades y Eventos</h1>
                <span className="ev-badge">Gestión</span>
              </div>
              <p className="ev-subtitle">Crea y administra actividades comunitarias, controla sus fechas, cupos y asistencia de participantes.</p>
            </div>
            <Link to="/directiva" className="ev-button">← Volver al Panel</Link>
          </div>
        </header>

        {!cargando && !error && (
          <div className="ev-stats">
            {[
              { titulo: 'Total de eventos', valor: eventos.length, detalle: 'Registrados' },
              { titulo: 'Programados', valor: totalProgramados, detalle: 'Próximos' },
              { titulo: 'Finalizados', valor: totalFinalizados, detalle: 'Completados' },
              { titulo: 'Cancelados', valor: totalCancelados, detalle: 'Cancelados' },
            ].map((item) => (
              <div className="ev-panel ev-stat" key={item.titulo}>
                <p className="ev-stat-title">{item.titulo}</p>
                <div className="ev-stat-foot"><span className="ev-stat-value">{item.valor}</span><span className="ev-badge">{item.detalle}</span></div>
              </div>
            ))}
          </div>
        )}

        {!cargandoDirectiva && !habilitado && (
          <div className="ev-alert ev-alert-pending" role="status">
            <strong>Pendiente de habilitación.</strong> {errorDirectiva || 'Para gestionar eventos necesitas una directiva vigente.'} Puedes revisar el diseño, pero crear, editar y cancelar eventos permanecerá deshabilitado.
          </div>
        )}

        <form onSubmit={(event) => void crearEvento(event)} className="ev-panel ev-form">
          <div className="ev-form-header">
            <div className="ev-row">
              <div>
                <div className="ev-title-row">
                  <h2>{eventoAEditar ? 'Editar evento' : 'Crear nuevo evento'}</h2>
                  <span className="ev-badge">{eventoAEditar ? 'Modo edición' : habilitado ? 'Nuevo' : 'Pendiente de habilitación'}</span>
                </div>
                <p className="ev-subtitle">{eventoAEditar ? 'Modifica la información del evento seleccionado.' : 'Completa los datos para registrar una actividad comunitaria.'}</p>
              </div>
              {eventoAEditar && <span className="ev-badge">Evento #{eventoAEditar.id}</span>}
            </div>
          </div>
          <div className="ev-form-body">
            {mensaje && <div className={`ev-alert ${tipoMensaje === 'error' ? 'ev-alert-error' : 'ev-alert-success'}`} role="status">{mensaje}</div>}
            <div className="ev-fields">
              <label className="ev-field"><span className="ev-field-label">Título *</span><input className="ev-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Reunión comunitaria" disabled={!habilitado} required /></label>
              <label className="ev-field"><span className="ev-field-label">Lugar *</span><input className="ev-input" value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="Ej: Sede vecinal" disabled={!habilitado} required /></label>
              <label className="ev-field"><span className="ev-field-label">Fecha de inicio *</span><input type="datetime-local" className="ev-input" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} disabled={!habilitado} required /></label>
              <label className="ev-field"><span className="ev-field-label">Fecha de término</span><input type="datetime-local" className="ev-input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={!habilitado} /></label>
              <label className="ev-field"><span className="ev-field-label">Cupo máximo</span><input type="number" min="1" className="ev-input" value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} placeholder="Sin límite" disabled={!habilitado} /><span className="ev-field-hint">Déjalo vacío si la actividad no tiene límite.</span></label>
              <label className="ev-field ev-field-wide"><span className="ev-field-label">Descripción *</span><textarea className="ev-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe el objetivo y los detalles del evento..." disabled={!habilitado} required /></label>
            </div>
            <div className="ev-form-actions">
              {eventoAEditar && <button type="button" className="ev-button" disabled={creando} onClick={cancelarEdicion}>Cancelar edición</button>}
              <button type="submit" className="ev-button ev-button-primary" disabled={creando || !habilitado}>
                {creando ? 'Guardando...' : !habilitado ? 'Pendiente de habilitación' : eventoAEditar ? 'Guardar cambios' : 'Crear evento'}
              </button>
            </div>
          </div>
        </form>

        {cargando && <div className="ev-alert ev-alert-pending" role="status">Cargando actividades y eventos...</div>}
        {error && <div className="ev-alert ev-alert-error" role="alert">{error}</div>}

        <section>
          <div className="ev-list-heading">
            <div><h2>Eventos registrados</h2><p className="ev-subtitle">Revisa las actividades de la junta de vecinos.</p></div>
            {!cargando && !error && <span className="ev-badge">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</span>}
          </div>
          {!cargando && !error && (eventos.length === 0 ? (
            <div className="ev-panel ev-empty"><h3>No hay eventos registrados</h3><p className="ev-subtitle">{habilitado ? 'Utiliza el formulario superior para crear la primera actividad.' : 'Los eventos aparecerán aquí cuando estén disponibles.'}</p></div>
          ) : (
            <div className="ev-grid">
              {eventos.map((evento) => (
                <article className="ev-panel ev-card" key={evento.id}>
                  <div className="ev-card-content">
                    <div className="ev-card-title">
                      <div><p className="ev-data-label">{evento.junta_nombre}</p><h3>{evento.titulo}</h3></div>
                      <span className={`ev-badge ev-badge-${evento.estado.toLowerCase()}`}>{etiquetaEstado(evento.estado)}</span>
                    </div>
                    <p className="ev-card-desc">{evento.descripcion}</p>
                    <div className="ev-data-grid">
                      <div className="ev-data-box"><p className="ev-data-label">Lugar</p><p className="ev-data-value">{evento.lugar}</p></div>
                      <div className="ev-data-box"><p className="ev-data-label">Cupo</p><p className="ev-data-value">{evento.cupo_maximo !== null ? `${evento.cupo_maximo} personas` : 'Sin límite'}</p></div>
                      <div className="ev-data-box"><p className="ev-data-label">Inicio</p><p className="ev-data-value">{formatearFecha(evento.fecha_inicio)}</p></div>
                      <div className="ev-data-box"><p className="ev-data-label">Término</p><p className="ev-data-value">{evento.fecha_fin ? formatearFecha(evento.fecha_fin) : 'Sin definir'}</p></div>
                    </div>
                    <div className="ev-meta"><span>Creado por {evento.creador_username}</span><span>Evento #{evento.id}</span></div>
                  </div>
                  {evento.estado !== 'CANCELADO' && (
                    <div className="ev-card-actions">
                      {habilitado ? (
                        <Link to={`/directiva/eventos/${evento.id}/asistencia`} className="ev-button ev-button-primary">
                          {evento.estado === 'FINALIZADO' ? 'Ver asistencia' : 'Gestionar asistencia'}
                        </Link>
                      ) : (
                        <button type="button" className="ev-button" disabled>Asistencia pendiente</button>
                      )}
                      {evento.estado === 'PROGRAMADO' && (
                        <>
                          <button type="button" className="ev-button" disabled={!habilitado} onClick={() => prepararEdicion(evento)}>Editar</button>
                          <button type="button" className="ev-button ev-button-danger" disabled={!habilitado} onClick={() => setEventoACancelar(evento)}>Cancelar</button>
                        </>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ))}
        </section>
      </section>

      {eventoACancelar && habilitado && (
        <div className="ev-dialog" role="presentation" onClick={() => { if (!cancelando) setEventoACancelar(null) }}>
          <div className="ev-panel ev-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="ev-cancel-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="ev-cancel-title">Cancelar evento</h3>
            <p className="ev-subtitle">Estás a punto de cancelar el evento <strong>{eventoACancelar.titulo}</strong>.</p>
            <div className="ev-alert ev-alert-pending" style={{ marginTop: 18 }}>El evento quedará registrado como cancelado.</div>
            <div className="ev-dialog-actions">
              <button type="button" className="ev-button" disabled={cancelando} onClick={() => setEventoACancelar(null)}>Volver</button>
              <button type="button" className="ev-button ev-button-danger" disabled={cancelando} onClick={() => void cancelarEvento(eventoACancelar.id)}>{cancelando ? 'Cancelando...' : 'Sí, cancelar evento'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default EventosPage
