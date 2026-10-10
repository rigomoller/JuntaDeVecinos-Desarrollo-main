import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Link } from 'react-router-dom'

type Publicacion = {

    id: number

    directiva: number

    junta_nombre: string

    autor: number

    autor_username: string

    titulo: string

    contenido: string

    fecha_publicacion: string

    activa: boolean

    adjuntos: {

        id: number

        archivo: string

        nombre_original: string

        fecha_subida: string

    }[]

}

type IntegranteDirectiva = {

    id: number

    directiva: number

    activo: boolean

}

function PublicacionesPage() {

    const [publicaciones, setPublicaciones] =

        useState<Publicacion[]>([])

    const [cargando, setCargando] = useState(true)

    const [error, setError] = useState('')

    const [directivaId, setDirectivaId] =

        useState<number | null>(null)

    const [titulo, setTitulo] = useState('')

    const [contenido, setContenido] = useState('')

    const [publicando, setPublicando] = useState(false)

    const [mensaje, setMensaje] = useState('')

    const [archivoSeleccionado, setArchivoSeleccionado] =

        useState<File | null>(null)

    const [publicacionParaAdjunto, setPublicacionParaAdjunto] =

        useState<number | null>(null)

    const [subiendoArchivo, setSubiendoArchivo] =

        useState(false)

    useEffect(() => {

        const cargarPublicaciones = async () => {

            try {

                setCargando(true)

                setError('')

                const response = await fetch(

                    'http://localhost:8000/api/comunicaciones/publicaciones/',

                    {

                        credentials: 'include',

                    }

                )

                if (!response.ok) {

                    throw new Error(

                        'No fue posible cargar los comunicados.'

                    )

                }

                const data =

                    (await response.json()) as Publicacion[]

                setPublicaciones(data)

            } catch (error) {

                setError(

                    error instanceof Error

                        ? error.message

                        : 'Ocurrió un error inesperado.'

                )

            } finally {

                setCargando(false)

            }

        }

        void cargarPublicaciones()

    }, [])

    useEffect(() => {

        const cargarDirectivaActual = async () => {

            try {

                const response = await fetch(

                    'http://localhost:8000/api/organizacion/integrantes-directiva/',

                    {

                        credentials: 'include',

                    }

                )

                if (!response.ok) {

                    throw new Error(

                        'No fue posible obtener la directiva actual.'

                    )

                }

                const data =

                    (await response.json()) as IntegranteDirectiva[]

                const integranteActivo = data.find(

                    (integrante) => integrante.activo

                )

                if (!integranteActivo) {

                    throw new Error(

                        'No se encontró una directiva vigente asociada al usuario.'

                    )

                }

                setDirectivaId(

                    integranteActivo.directiva

                )

            } catch (error) {

                setError(

                    error instanceof Error

                        ? error.message

                        : 'Ocurrió un error inesperado.'

                )

            }

        }

        void cargarDirectivaActual()

    }, [])

    async function crearPublicacion(

        event: FormEvent<HTMLFormElement>

    ) {

        event.preventDefault()

        if (!directivaId) {

            setError(

                'No se encontró una directiva vigente asociada al usuario.'

            )

            return

        }

        setPublicando(true)

        setError('')

        setMensaje('')

        try {

            const response = await fetch(

                'http://localhost:8000/api/comunicaciones/publicaciones/',

                {

                    method: 'POST',

                    credentials: 'include',

                    headers: {

                        'Content-Type': 'application/json',

                    },

                    body: JSON.stringify({

                        directiva: directivaId,

                        titulo,

                        contenido,

                        activa: true,

                    }),

                }

            )

            const data = await response.json()

            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    'No fue posible publicar el comunicado.'

                )

            }

            setPublicaciones((actuales) => [

                data,

                ...actuales,

            ])

            setTitulo('')

            setContenido('')

            setMensaje(

                'Comunicado publicado correctamente.'

            )

        } catch (error) {

            setError(

                error instanceof Error

                    ? error.message

                    : 'Ocurrió un error al publicar el comunicado.'

            )

        } finally {

            setPublicando(false)

        }

    }

    async function subirAdjunto() {

        if (

            !archivoSeleccionado ||

            !publicacionParaAdjunto

        ) {

            return

        }

        setSubiendoArchivo(true)

        setError('')

        setMensaje('')

        try {

            const formData = new FormData()

            formData.append(

                'archivo',

                archivoSeleccionado

            )

            const response = await fetch(

                `http://localhost:8000/api/comunicaciones/publicaciones/${publicacionParaAdjunto}/adjuntos/`,

                {

                    method: 'POST',

                    credentials: 'include',

                    body: formData,

                }

            )

            const data = await response.json()

            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    'No fue posible subir el archivo.'

                )

            }

            setPublicaciones((actuales) =>

                actuales.map((publicacion) =>

                    publicacion.id === publicacionParaAdjunto

                        ? {

                            ...publicacion,

                            adjuntos: [

                                ...publicacion.adjuntos,

                                data,

                            ],

                        }

                        : publicacion

                )

            )

            setArchivoSeleccionado(null)

            setPublicacionParaAdjunto(null)

            setMensaje(

                'Archivo adjunto correctamente.'

            )

        } catch (error) {

            setError(

                error instanceof Error

                    ? error.message

                    : 'Ocurrió un error al subir el archivo.'

            )

        } finally {

            setSubiendoArchivo(false)

        }

    }

    return (

        <main className="publicaciones-bosque min-h-screen px-4 py-8">
            <style>{`
.publicaciones-bosque {
  --pb-crema:#f6efd9; --pb-oro:#d7ac32;
  min-height:100vh; color:var(--pb-crema);
  background-color:#092318;
  background-image:linear-gradient(120deg,rgba(4,23,16,.35),rgba(4,23,16,.48)),url('/comunicado-directiva.webp');
  background-position:center; background-size:cover; background-repeat:no-repeat; background-attachment:fixed;
  font-family:'Segoe UI',Arial,sans-serif;
}
.publicaciones-bosque, .publicaciones-bosque * {box-sizing:border-box}
.publicaciones-bosque .bg-base-100 {
  background:rgba(8,29,19,.76)!important; border-color:rgba(215,172,50,.36)!important;
  box-shadow:0 12px 30px rgba(0,0,0,.2); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px);
}
.publicaciones-bosque h1,.publicaciones-bosque h2,.publicaciones-bosque h3,.publicaciones-bosque h4 {
  font-family:Georgia,'Times New Roman',serif; color:var(--pb-crema); font-weight:700;
}
.publicaciones-bosque h1{font-size:clamp(30px,3vw,42px)}
.publicaciones-bosque .text-base-content\\/70,.publicaciones-bosque .text-base-content\\/60,
.publicaciones-bosque .text-base-content\\/55,.publicaciones-bosque .text-base-content\\/50,
.publicaciones-bosque .text-base-content\\/45,.publicaciones-bosque .text-base-content\\/80,
.publicaciones-bosque .text-base-content\\/75 {color:#cbd2c4!important}
.publicaciones-bosque .text-3xl{color:#e4c55b}
.publicaciones-bosque .badge{background:rgba(215,172,50,.16);border:1px solid rgba(215,172,50,.48);color:#f0d375;font-weight:700}
.publicaciones-bosque .badge-success{background:rgba(35,128,77,.25);border-color:#579e75;color:#a8edc2}
.publicaciones-bosque .badge-ghost{background:rgba(230,230,210,.08);color:#e2e3dd}
.publicaciones-bosque .btn-primary {
  background:linear-gradient(115deg,#e4c55b,#c49a28)!important;
  color:#102419!important;border:1px solid #d7ac32!important;border-radius:13px;font-weight:800;
}
.publicaciones-bosque .btn-outline {
  background:rgba(215,172,50,.17)!important;color:#f6e6b5!important;
  border:1px solid #d7ac32!important;border-radius:13px;font-weight:700;
}
.publicaciones-bosque .btn-outline:hover:not(:disabled),.publicaciones-bosque .btn-primary:hover:not(:disabled){background:#f0d67c!important;color:#102419!important}
.publicaciones-bosque .btn:disabled {opacity:.57;cursor:not-allowed}
.publicaciones-bosque .input,.publicaciones-bosque .textarea,.publicaciones-bosque .file-input {
  background:rgba(5,25,16,.86)!important;color:#f6efd9!important;border-color:rgba(215,172,50,.45)!important;border-radius:12px;
}
.publicaciones-bosque input::placeholder,.publicaciones-bosque textarea::placeholder{color:#bac6b8}
.publicaciones-bosque .label-text {color:#f6efd9!important}
.publicaciones-bosque .border-base-300{border-color:rgba(215,172,50,.28)!important}
.publicaciones-bosque .bg-base-200\\/40{background:rgba(5,25,16,.4)!important}
.publicaciones-bosque .alert-error{background:rgba(118,33,35,.84)!important;color:#ffe4e4!important;border:1px solid rgba(231,104,104,.5)!important}
.publicaciones-bosque .alert-success{background:rgba(25,88,54,.86)!important;color:#dcffdf!important;border:1px solid #589b73!important}
.publicaciones-bosque .pub-pending{
  display:flex;gap:8px;flex-wrap:wrap;align-items:center;
  margin-bottom:22px;padding:16px 20px;border-radius:14px;
  background:rgba(52,46,19,.83);border:1px solid rgba(215,172,50,.46);color:#f6efd9;
}
.publicaciones-bosque .pub-pending strong{color:#f0d375}
.publicaciones-bosque a:focus-visible,.publicaciones-bosque button:focus-visible{outline:2px solid #f0d375;outline-offset:3px}
@media(max-width:768px){.publicaciones-bosque{background-attachment:scroll;padding:18px 12px}.publicaciones-bosque .bg-base-100{border-radius:18px}}
`}</style>

            <section className="mx-auto w-full max-w-7xl">

                {/* Encabezado */}

                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">

                    <div className="flex flex-wrap items-start justify-between gap-5">

                        <div>

                            <div className="mb-3 flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold">

                                    Comunicados

                                </h1>

                                <span className="badge badge-primary badge-lg">

                                    Directiva

                                </span>

                            </div>

                            <p className="max-w-2xl text-base-content/70">

                                Publica avisos, información y documentos para los vecinos de la junta.

                            </p>

                        </div>

                        <Link

                            to="/directiva"

                            className="btn btn-outline publicaciones-volver"

                        >

                            ← Volver al Panel

                        </Link>

                    </div>

                </div>

                {/* Resumen */}

                {!cargando && (

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        <div className="rounded-2xl border border-blue-500/30 bg-base-100 p-5 shadow-sm">

                            <p className="text-sm font-medium text-base-content/60">

                                Comunicados

                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">

                                <span className="text-3xl font-bold">

                                    {error ? "—" : publicaciones.length}

                                </span>

                                <span className="badge badge-info badge-outline">

                                    Publicados

                                </span>

                            </div>

                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">

                            <p className="text-sm font-medium text-base-content/60">

                                Activos

                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">

                                <span className="text-3xl font-bold">

                                    {error ? "—" : publicaciones.filter((publicacion) => publicacion.activa).length}

                                </span>

                                <span className="badge badge-success badge-outline">

                                    Visibles

                                </span>

                            </div>

                        </div>

                        <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">

                            <p className="text-sm font-medium text-base-content/60">

                                Archivos adjuntos

                            </p>

                            <div className="mt-2 flex items-end justify-between gap-3">

                                <span className="text-3xl font-bold">

                                    {error ? "—" : publicaciones.reduce(

                                        (total, publicacion) => total + publicacion.adjuntos.length,

                                        0

                                    )}

                                </span>

                                <span className="badge badge-info badge-outline">

                                    Documentos

                                </span>

                            </div>

                        </div>

                    </div>

                )}

                {!directivaId && !cargando && (
                    <div className="pub-pending" role="status">
                        <strong>Pendiente de habilitación</strong>
                        <span>El formulario se puede visualizar, pero publicar y adjuntar archivos requiere una directiva vigente.</span>
                    </div>
                )}

                {/* Nuevo comunicado */}

                <form

                    onSubmit={crearPublicacion}

                    className="mb-6 overflow-hidden rounded-2xl border border-blue-500/30 bg-base-100 shadow-sm"

                >

                    <div className="border-b border-base-300 p-6">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>

                                <div className="mb-2 flex flex-wrap items-center gap-3">

                                    <h2 className="text-2xl font-bold">

                                        Nuevo comunicado

                                    </h2>

                                    <span className="badge badge-primary badge-outline">

                                        Nueva publicación

                                    </span>

                                </div>

                                <p className="text-base-content/60">

                                    Redacta un aviso para informar a los vecinos de la junta.

                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="p-6">

                        <div className="grid gap-5">

                            <label className="form-control">

                                <div className="label">

                                    <span className="label-text font-semibold">

                                        Título

                                    </span>

                                    <span className="label-text-alt text-error">

                                        Obligatorio

                                    </span>

                                </div>

                                <input

                                    type="text"

                                    className="input input-bordered w-full"

                                    value={titulo}

                                    onChange={(event) =>

                                        setTitulo(event.target.value)

                                    }

                                    maxLength={200}

                                    placeholder="Ej: Reunión extraordinaria de vecinos"

                                    required

                                />

                                <div className="mt-2 flex justify-end">

                                    <span className="text-xs text-base-content/45">

                                        {titulo.length}/200

                                    </span>

                                </div>

                            </label>

                            <label className="form-control">

                                <div className="label">

                                    <span className="label-text font-semibold">

                                        Contenido

                                    </span>

                                    <span className="label-text-alt text-error">

                                        Obligatorio

                                    </span>

                                </div>

                                <textarea

                                    className="textarea textarea-bordered min-h-40 w-full resize-y"

                                    value={contenido}

                                    onChange={(event) =>

                                        setContenido(event.target.value)

                                    }

                                    placeholder="Escribe aquí la información que deseas comunicar a los vecinos..."

                                    required

                                />

                            </label>

                        </div>

                        {mensaje && (

                            <div className="alert alert-success mt-6 shadow-sm">

                                <span>{mensaje}</span>

                            </div>

                        )}

                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">

                            <button

                                type="submit"

                                className="btn btn-primary"

                                disabled={

                                    publicando ||

                                    !directivaId ||

                                    !titulo.trim() ||

                                    !contenido.trim()

                                }

                            >

                                {publicando && (

                                    <span className="loading loading-spinner loading-sm" />

                                )}

                                {publicando

                                    ? 'Publicando...'

                                    : 'Publicar comunicado'}

                            </button>

                        </div>

                    </div>

                </form>

                {/* Cargando */}

                {cargando && (

                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">

                        <span className="loading loading-spinner loading-sm" />

                        <span>Cargando comunicados...</span>

                    </div>

                )}

                {/* Error */}

                {error && (

                    <div className="alert alert-error mb-6 shadow-sm">

                        <span>{error}</span>

                    </div>

                )}

                {/* Listado */}

                {!cargando && (

                    <div>

                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">

                            <div>

                                <h2 className="text-2xl font-bold">

                                    Comunicados publicados

                                </h2>

                                <p className="mt-1 text-base-content/60">

                                    Historial de información publicada para la comunidad.

                                </p>

                            </div>

                            {publicaciones.length > 0 && (

                                <span className="badge badge-outline badge-lg">

                                    {publicaciones.length}{' '}

                                    {publicaciones.length === 1

                                        ? 'comunicado'

                                        : 'comunicados'}

                                </span>

                            )}

                        </div>

                        {publicaciones.length === 0 ? (

                            <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">

                                <div className="mx-auto max-w-md">

                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">

                                        +

                                    </div>

                                    <h3 className="text-xl font-bold">

                                        {error ? "No se pudieron consultar los comunicados" : "No hay comunicados publicados"}

                                    </h3>

                                    <p className="mt-2 text-base-content/60">

                                        {error ? "El historial no está disponible hasta que se restablezca la conexión." : "Utiliza el formulario superior para crear el primer comunicado para los vecinos."}

                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div className="space-y-5">

                                {publicaciones.map((publicacion) => (

                                    <article

                                        key={publicacion.id}

                                        className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:border-blue-500/30 hover:shadow-md"

                                    >

                                        <div className="p-6">

                                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">

                                                <div className="min-w-0 flex-1">

                                                    <div className="mb-2 flex flex-wrap items-center gap-2">

                                                        <span className="text-sm font-semibold uppercase tracking-wide text-base-content/45">

                                                            {publicacion.junta_nombre}

                                                        </span>

                                                        {publicacion.activa ? (

                                                            <span className="badge badge-success badge-outline badge-sm">

                                                                Activo

                                                            </span>

                                                        ) : (

                                                            <span className="badge badge-ghost badge-sm">

                                                                Inactivo

                                                            </span>

                                                        )}

                                                    </div>

                                                    <h3 className="text-xl font-bold leading-snug">

                                                        {publicacion.titulo}

                                                    </h3>

                                                </div>

                                                <span className="badge badge-outline">

                                                    #{publicacion.id}

                                                </span>

                                            </div>

                                            <div className="whitespace-pre-wrap leading-relaxed text-base-content/80">

                                                {publicacion.contenido}

                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-base-300 pt-4 text-sm text-base-content/55">

                                                <span>

                                                    Publicado por{' '}

                                                    <strong className="font-semibold text-base-content/75">

                                                        {publicacion.autor_username}

                                                    </strong>

                                                </span>

                                                <span>

                                                    {new Date(

                                                        publicacion.fecha_publicacion

                                                    ).toLocaleString('es-CL')}

                                                </span>

                                                <span>

                                                    {publicacion.adjuntos.length}{' '}

                                                    {publicacion.adjuntos.length === 1

                                                        ? 'archivo adjunto'

                                                        : 'archivos adjuntos'}

                                                </span>

                                            </div>

                                        </div>

                                        {/* Adjuntos existentes */}

                                        {publicacion.adjuntos.length > 0 && (

                                            <div className="border-t border-base-300 bg-base-200/40 px-6 py-5">

                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                                                    <h4 className="font-bold">

                                                        Archivos adjuntos

                                                    </h4>

                                                    <span className="badge badge-outline">

                                                        {publicacion.adjuntos.length}

                                                    </span>

                                                </div>

                                                <div className="grid gap-3">

                                                    {publicacion.adjuntos.map((adjunto) => (

                                                        <div

                                                            key={adjunto.id}

                                                            className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between"

                                                        >

                                                            <div className="min-w-0">

                                                                <p className="break-all font-medium">

                                                                    {adjunto.nombre_original}

                                                                </p>

                                                                <p className="mt-1 text-xs text-base-content/50">

                                                                    Subido el{' '}

                                                                    {new Date(

                                                                        adjunto.fecha_subida

                                                                    ).toLocaleString('es-CL')}

                                                                </p>

                                                            </div>

                                                            <div className="flex shrink-0 flex-wrap gap-2">

                                                                <a

                                                                    href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/`}

                                                                    target="_blank"

                                                                    rel="noopener"

                                                                    className="btn btn-sm btn-outline"

                                                                >

                                                                    Ver

                                                                </a>

                                                                <a

                                                                    href={`http://localhost:8000/api/comunicaciones/adjuntos/${adjunto.id}/descargar/?download=1`}

                                                                    className="btn btn-sm btn-primary"

                                                                >

                                                                    Descargar

                                                                </a>

                                                            </div>

                                                        </div>

                                                    ))}

                                                </div>

                                            </div>

                                        )}

                                        {/* Nuevo adjunto */}

                                        <div className="border-t border-base-300 p-6">

                                            <div className="mb-3">

                                                <h4 className="font-bold">

                                                    Adjuntar archivo

                                                </h4>

                                                <p className="mt-1 text-sm text-base-content/55">

                                                    Selecciona un documento para agregarlo a este comunicado.

                                                </p>

                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row">

                                                <input

                                                    type="file"

                                                    className="file-input file-input-bordered w-full"

                                                    disabled={!directivaId}
                                            onChange={(event) => {

                                                        const archivo =

                                                            event.target.files?.[0] ?? null

                                                        setArchivoSeleccionado(archivo)

                                                        setPublicacionParaAdjunto(

                                                            archivo ? publicacion.id : null

                                                        )

                                                    }}

                                                />

                                                <button

                                                    type="button"

                                                    className="btn btn-outline sm:min-w-36"

                                                    disabled={

                                                        subiendoArchivo ||
                                            !directivaId ||

                                                        !archivoSeleccionado ||

                                                        publicacionParaAdjunto !== publicacion.id

                                                    }

                                                    onClick={subirAdjunto}

                                                >

                                                    {subiendoArchivo &&

                                                    publicacionParaAdjunto === publicacion.id ? (

                                                        <>

                                                            <span className="loading loading-spinner loading-sm" />

                                                            Subiendo...

                                                        </>

                                                    ) : (

                                                        'Subir archivo'

                                                    )}

                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        )}

                    </div>

                )}

            </section>

        </main>

    )

}

export default PublicacionesPage
