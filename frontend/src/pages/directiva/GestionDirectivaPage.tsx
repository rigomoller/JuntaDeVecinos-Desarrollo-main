import { useEffect, useState } from 'react'

import {

    Link,

    useSearchParams,

} from 'react-router-dom'





type UsuarioElegible = {

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



type IntegranteDirectivaActual = {

    id: number

    directiva: number

    usuario: number

    usuario_username: string

    usuario_nombres: string

    usuario_apellido_paterno: string

    cargo: number

    cargo_nombre: string

    junta_id: number

    junta_nombre: string

    fecha_inicio: string

    fecha_fin: string | null

    activo: boolean

}



type Cargo = {

    id: number

    nombre: string

    descripcion: string | null

    permite_multiples: boolean

    activo: boolean

}



function GestionDirectivaPage() {

    const [searchParams] = useSearchParams()



    const directivaIdDesdeUrl =

        searchParams.get('directivaId')



    const [usuariosElegibles, setUsuariosElegibles] =

        useState<UsuarioElegible[]>([])



    const [integrantesActuales, setIntegrantesActuales] =

        useState<IntegranteDirectivaActual[]>([])



    const [cargos, setCargos] =

        useState<Cargo[]>([])



    const [usuarioSeleccionado, setUsuarioSeleccionado] =

        useState('')



    const [cargoSeleccionado, setCargoSeleccionado] =

        useState('')



    const [guardandoAsignacion, setGuardandoAsignacion] =

        useState(false)



    const [directivaId, setDirectivaId] =

        useState<number | null>(null)



    const [cargando, setCargando] =

        useState(true)



    const [error, setError] =

        useState('')



    const [integranteReasignando, setIntegranteReasignando] =

        useState<IntegranteDirectivaActual | null>(null)



    const [nuevoCargoSeleccionado, setNuevoCargoSeleccionado] =

        useState('')



    const [reasignandoCargo, setReasignandoCargo] =

        useState(false)



    useEffect(() => {

        const cargarDirectivaActual = async () => {

            try {

                setCargando(true)

                setError('')



                const response = await fetch(

                    'http://localhost:8000/api/organizacion/integrantes-directiva/',

                    {

                        credentials: 'include',

                    },

                )



                if (!response.ok) {

                    throw new Error(

                        'No fue posible obtener la directiva actual.',

                    )

                }



                const data =

                    (await response.json()) as IntegranteDirectivaActual[]



                // Si viene una Directiva en la URL, estamos entrando

                // desde el Panel de Administración.

                if (directivaIdDesdeUrl) {

                    const idDirectiva = Number(directivaIdDesdeUrl)



                    if (Number.isNaN(idDirectiva)) {

                        throw new Error(

                            'El identificador de la directiva no es válido.',

                        )

                    }



                    setDirectivaId(idDirectiva)



                    setIntegrantesActuales(

                        data.filter(

                            (integrante) =>

                                integrante.directiva === idDirectiva &&

                                integrante.activo,

                        ),

                    )



                    return

                }



                // Si no viene ID en la URL, corresponde al acceso

                // normal de un integrante de Directiva.

                if (data.length === 0) {

                    throw new Error(

                        'No se encontró una directiva vigente asociada al usuario.',

                    )

                }



                setIntegrantesActuales(

                    data.filter(

                        (integrante) =>

                            integrante.directiva === data[0].directiva &&

                            integrante.activo,

                    ),

                )



                setDirectivaId(data[0].directiva)

            } catch (error) {

                setError(

                    error instanceof Error

                        ? error.message

                        : 'Ocurrió un error inesperado.',

                )

            } finally {

                setCargando(false)

            }

        }



        void cargarDirectivaActual()

    }, [directivaIdDesdeUrl])



    useEffect(() => {

        if (directivaId === null) {

            return

        }



        const cargarUsuariosElegibles = async () => {

            try {

                setCargando(true)

                setError('')



                const response = await fetch(

                    `http://localhost:8000/api/organizacion/directivas/${directivaId}/usuarios-elegibles/`,

                    {

                        credentials: 'include',

                    },

                )



                if (!response.ok) {

                    throw new Error(

                        'No fue posible cargar los usuarios elegibles.',

                    )

                }



                const data =

                    (await response.json()) as UsuarioElegible[]



                setUsuariosElegibles(data)

            } catch (error) {

                setError(

                    error instanceof Error

                        ? error.message

                        : 'Ocurrió un error inesperado.',

                )

            } finally {

                setCargando(false)

            }

        }



        void cargarUsuariosElegibles()

    }, [directivaId])



    useEffect(() => {

        const cargarCargos = async () => {

            try {

                const response = await fetch(

                    'http://localhost:8000/api/organizacion/cargos/',

                    {

                        credentials: 'include',

                    },

                )



                if (!response.ok) {

                    throw new Error(

                        'No fue posible cargar los cargos.',

                    )

                }



                const data =

                    (await response.json()) as Cargo[]



                setCargos(

                    data.filter((cargo) => cargo.activo),

                )

            } catch (error) {

                setError(

                    error instanceof Error

                        ? error.message

                        : 'Ocurrió un error inesperado.',

                )

            }

        }



        void cargarCargos()

    }, [])



    const asignarIntegrante = async () => {
        if (directivaId === null || cargando || error) return

        if (

            directivaId === null ||

            !usuarioSeleccionado ||

            !cargoSeleccionado

        ) {

            setError(

                'Debe seleccionar un usuario y un cargo.',

            )

            return

        }



        try {

            setGuardandoAsignacion(true)

            setError('')



            const response = await fetch(

                'http://localhost:8000/api/organizacion/integrantes-directiva/',

                {

                    method: 'POST',

                    credentials: 'include',

                    headers: {

                        'Content-Type': 'application/json',

                    },

                    body: JSON.stringify({

                        directiva: directivaId,

                        usuario: Number(usuarioSeleccionado),

                        cargo: Number(cargoSeleccionado),

                        fecha_inicio: new Date()

                            .toISOString()

                            .slice(0, 10),

                        activo: true,

                    }),

                },

            )



            const data = await response.json()



            if (!response.ok) {

                throw new Error(

                    data.detail ??

                    data.usuario?.[0] ??

                    data.cargo?.[0] ??

                    'No fue posible asignar el integrante.',

                )

            }



            setIntegrantesActuales((actuales) => [

                ...actuales,

                data as IntegranteDirectivaActual,

            ])



            setUsuariosElegibles((actuales) =>

                actuales.filter(

                    (usuario) =>

                        usuario.id !== Number(usuarioSeleccionado),

                ),

            )



            setUsuarioSeleccionado('')

            setCargoSeleccionado('')

        } catch (error) {

            setError(

                error instanceof Error

                    ? error.message

                    : 'Ocurrió un error inesperado.',

            )

        } finally {

            setGuardandoAsignacion(false)

        }

    }



    const reasignarCargoIntegrante = async () => {
        if (directivaId === null || cargando || error) return

        if (

            integranteReasignando === null ||

            !nuevoCargoSeleccionado

        ) {

            setError(

                'Debe seleccionar un nuevo cargo.',

            )

            return

        }



        try {

            setReasignandoCargo(true)

            setError('')



            const response = await fetch(

                `http://localhost:8000/api/organizacion/integrantes-directiva/${integranteReasignando.id}/reasignar/`,

                {

                    method: 'POST',

                    credentials: 'include',

                    headers: {

                        'Content-Type': 'application/json',

                    },

                    body: JSON.stringify({

                        cargo: Number(nuevoCargoSeleccionado),

                    }),

                },

            )



            const data = await response.json()



            if (!response.ok) {

                throw new Error(

                    data.detail ??

                    data.cargo?.[0] ??

                    'No fue posible reasignar el cargo.',

                )

            }



            setIntegrantesActuales((actuales) =>

                actuales.map((integrante) =>

                    integrante.id === integranteReasignando.id

                        ? (data as IntegranteDirectivaActual)

                        : integrante,

                ),

            )



            setIntegranteReasignando(null)

            setNuevoCargoSeleccionado('')

        } catch (error) {

            setError(

                error instanceof Error

                    ? error.message

                    : 'Ocurrió un error inesperado.',

            )

        } finally {

            setReasignandoCargo(false)

        }

    }



    const puedeGestionar = directivaId !== null && !cargando && !error

    return (

        <main className="gestion-directiva-bosque min-h-screen px-4 py-8">
            <style>{`
/* GESTIÓN DE DIRECTIVA · MISMO ESTILO DEL PANEL */
.gestion-directiva-bosque {
  --gd-oro: #d7ac32;
  --gd-crema: #f6efd9;
  --gd-verde: #092318;
  min-height: 100vh;
  background-color: var(--gd-verde);
  background-image: linear-gradient(120deg, rgba(4,23,16,.35), rgba(4,23,16,.48)), url('/gestion-directiva.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: var(--gd-crema);
  font-family: 'Segoe UI', Arial, sans-serif;
}
.gestion-directiva-bosque > section { max-width: 1450px; }
.gestion-directiva-bosque .bg-base-100 {
  background: rgba(8,29,19,.76) !important;
  border: 1px solid rgba(215,172,50,.32);
  border-radius: 22px;
  box-shadow: 0 12px 35px rgba(0,0,0,.22);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.gestion-directiva-bosque h1,
.gestion-directiva-bosque h2,
.gestion-directiva-bosque h3 {
  color: var(--gd-crema);
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
}
.gestion-directiva-bosque h1 { font-size: clamp(30px,3vw,42px); color: #f6efd9 !important; }
.gestion-directiva-bosque h2 { font-size: clamp(24px,2.5vw,30px); }
.gestion-directiva-bosque .text-base-content\\/70,
.gestion-directiva-bosque .text-base-content\\/60,
.gestion-directiva-bosque .text-base-content\\/50,
.gestion-directiva-bosque .text-base-content\\/45 {
  color: #cbd2c4 !important;
}
/* Sólo cifras de las tarjetas en dorado, no el título principal */
.gestion-directiva-bosque .text-3xl:not(h1) { color: #e4c55b; font-weight: 800; }
.gestion-directiva-bosque .gd-pending {
  display: inline-flex; padding: 7px 14px; border-radius: 999px;
  color: #f0d375; border: 1px solid rgba(215,172,50,.5);
  background: rgba(215,172,50,.14); font-size: 13px; font-weight: 700;
}
.gestion-directiva-bosque .gd-placeholder {
  border: 1px dashed rgba(215,172,50,.35);
  background: rgba(8,29,19,.52); border-radius: 15px;
  padding: 22px; color: #d6d2bc;
}
.gestion-directiva-bosque fieldset:disabled, .gestion-directiva-bosque :disabled {
  cursor: not-allowed;
}
.gestion-directiva-bosque .badge {
  background: rgba(215,172,50,.17);
  border: 1px solid rgba(215,172,50,.5);
  border-radius: 999px;
  color: #f0d375;
  font-weight: 700;
  padding: 8px 14px;
  height: auto;
}
.gestion-directiva-bosque .badge-success {
  background: rgba(35,128,77,.25);
  color: #aff0c5;
  border-color: rgba(78,184,125,.55);
}
.gestion-directiva-bosque .badge-warning {
  background: rgba(176,112,16,.2);
  color: #ffda8a;
  border-color: rgba(255,196,86,.5);
}
.gestion-directiva-bosque .btn-primary {
  background: linear-gradient(115deg,#e4c55b,#c49a28) !important;
  border: 1px solid var(--gd-oro) !important;
  color: #102419 !important;
  border-radius: 13px;
  font-weight: 800;
  transition: transform .2s ease,background .2s ease,box-shadow .2s ease;
}
.gestion-directiva-bosque .btn-primary:hover:not(:disabled) {
  background: #f0d67c !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,.25);
}
.gestion-directiva-bosque .btn-outline {
  background: rgba(215,172,50,.16);
  border: 1px solid var(--gd-oro);
  color: #f6e6b5;
  border-radius: 12px;
  font-weight: 700;
}
.gestion-directiva-bosque .btn-outline:hover:not(:disabled) {
  background: var(--gd-oro);
  border-color: var(--gd-oro);
  color: #102419;
}
.gestion-directiva-bosque .btn:disabled { opacity: .55; cursor: not-allowed; }
.gestion-directiva-bosque .select,
.gestion-directiva-bosque .input,
.gestion-directiva-bosque .textarea {
  background: rgba(5,25,16,.88);
  color: var(--gd-crema);
  border: 1px solid rgba(215,172,50,.38);
  border-radius: 12px;
  min-height: 48px;
}
.gestion-directiva-bosque .select:focus,
.gestion-directiva-bosque .input:focus,
.gestion-directiva-bosque .textarea:focus {
  outline: 2px solid rgba(215,172,50,.55);
  outline-offset: 1px;
  border-color: var(--gd-oro);
}
.gestion-directiva-bosque option { background: #10291d; color: var(--gd-crema); }
.gestion-directiva-bosque .label-text { color: var(--gd-crema); font-weight: 700; }
.gestion-directiva-bosque .table { width: 100%; color: var(--gd-crema); border-collapse: collapse; }
.gestion-directiva-bosque .table thead { background: rgba(215,172,50,.12); color: #f0d375; }
.gestion-directiva-bosque .table th { color: #e9ce77; font-weight: 750; }
.gestion-directiva-bosque .table td { border-color: rgba(215,172,50,.18); }
.gestion-directiva-bosque .table tbody tr:hover { background: rgba(215,172,50,.09); }
.gestion-directiva-bosque .bg-base-200\\/60,
.gestion-directiva-bosque .bg-base-200\\/50 { background: rgba(5,25,16,.52) !important; }
.gestion-directiva-bosque .border-base-300 { border-color: rgba(215,172,50,.25) !important; }
.gestion-directiva-bosque .alert-error {
  background: rgba(118,33,35,.87);
  border: 1px solid rgba(231,104,104,.5);
  color: #ffe4e4;
  border-radius: 14px;
}
.gestion-directiva-bosque .alert:not(.alert-error) {
  background: rgba(8,29,19,.85);
  border: 1px solid rgba(215,172,50,.35);
  color: var(--gd-crema);
  border-radius: 14px;
}
.gestion-directiva-bosque a:focus-visible,
.gestion-directiva-bosque button:focus-visible {
  outline: 2px solid #f0d375;
  outline-offset: 3px;
}
@media (max-width: 768px) {
  .gestion-directiva-bosque { background-attachment: scroll; padding: 18px 12px; }
  .gestion-directiva-bosque .bg-base-100 { border-radius: 18px; }
  .gestion-directiva-bosque .btn { min-height: 45px; }
}

            `}</style>

            <section className="mx-auto w-full max-w-6xl">

                {/* Encabezado */}

                <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">

                    <div className="flex flex-wrap items-start justify-between gap-5">

                        <div>

                            <div className="mb-3 flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold">

                                    Gestión de Directiva

                                </h1>



                                <span className="badge badge-primary badge-lg">

                                    Directiva

                                </span>



                                {directivaIdDesdeUrl && (

                                    <span className="badge badge-secondary badge-outline badge-lg">

                                        Administración

                                    </span>

                                )}

                            </div>



                            <p className="max-w-2xl text-base-content/70">

                                Administración de integrantes y cargos de la directiva vigente.

                            </p>

                        </div>



                        <Link

                            to={

                                directivaIdDesdeUrl

                                    ? '/admin/directivas'

                                    : '/directiva'

                            }

                            className="btn btn-outline"

                        >

                            ←{' '}

                            {directivaIdDesdeUrl

                                ? 'Volver a Gestión de Directivas'

                                : 'Volver al Panel'}

                        </Link>

                    </div>

                </div>



                {/* Estado de carga */}

                {cargando && (

                    <div className="alert mb-6 border border-base-300 bg-base-100 shadow-sm">

                        <span className="loading loading-spinner loading-sm" />

                        <span>

                            Cargando información de la directiva...

                        </span>

                    </div>

                )}



                {/* Error */}

                {error && (

                    <div className="alert alert-error mb-6 shadow-sm">

                        <span>{error}</span>

                    </div>

                )}



                {!cargando && !puedeGestionar && (
                    <div className="mb-6 rounded-2xl border border-amber-500/40 bg-base-100 p-5 shadow-sm">
                        <span className="gd-pending">Pendiente de habilitación</span>
                        <p className="mt-3 text-base-content/70">
                            Las secciones de esta página se muestran para revisar su diseño.
                            No se pueden asignar integrantes ni modificar cargos hasta que exista
                            una directiva vigente y el servidor confirme el acceso.
                        </p>
                    </div>
                )}

                {!cargando && (

                    <>

                        {/* Resumen */}

                        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            <div className="rounded-2xl border border-indigo-500/30 bg-base-100 p-5 shadow-sm">

                                <p className="text-sm font-medium text-base-content/60">

                                    Integrantes actuales

                                </p>



                                <div className="mt-2 flex items-end justify-between gap-3">

                                    <span className="text-3xl font-bold">

                                        {puedeGestionar ? integrantesActuales.length : "—"}

                                    </span>



                                    <span className="badge badge-primary badge-outline">

                                        Activos

                                    </span>

                                </div>

                            </div>



                            <div className="rounded-2xl border border-emerald-500/30 bg-base-100 p-5 shadow-sm">

                                <p className="text-sm font-medium text-base-content/60">

                                    Usuarios elegibles

                                </p>



                                <div className="mt-2 flex items-end justify-between gap-3">

                                    <span className="text-3xl font-bold">

                                        {puedeGestionar ? usuariosElegibles.length : "—"}

                                    </span>



                                    <span className="badge badge-success badge-outline">

                                        Disponibles

                                    </span>

                                </div>

                            </div>



                            <div className="rounded-2xl border border-cyan-500/30 bg-base-100 p-5 shadow-sm sm:col-span-2 lg:col-span-1">

                                <p className="text-sm font-medium text-base-content/60">

                                    Cargos disponibles

                                </p>



                                <div className="mt-2 flex items-end justify-between gap-3">

                                    <span className="text-3xl font-bold">

                                        {puedeGestionar ? cargos.length : "—"}

                                    </span>



                                    <span className="badge badge-info badge-outline">

                                        Activos

                                    </span>

                                </div>

                            </div>

                        </div>



                        {/* Integrantes actuales */}

                        <div className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

                            <div className="border-b border-base-300 p-6">

                                <div className="flex flex-wrap items-center justify-between gap-4">

                                    <div>

                                        <h2 className="text-2xl font-bold">

                                            Integrantes actuales

                                        </h2>



                                        <p className="mt-1 text-base-content/60">

                                            Miembros activos y cargos asignados dentro de la directiva.

                                        </p>

                                    </div>



                                    <span className="badge badge-outline badge-lg">

                                        {integrantesActuales.length}{' '}

                                        {integrantesActuales.length === 1

                                            ? 'integrante'

                                            : 'integrantes'}

                                    </span>

                                </div>

                            </div>



                            <div className="overflow-x-auto">

                                <table className="table min-w-[820px]">

                                    <thead className="bg-base-200/60">

                                        <tr>

                                            <th className="pl-6">Nombre</th>

                                            <th>Usuario</th>

                                            <th>Cargo</th>

                                            <th>Estado</th>

                                            <th className="pr-6 text-right">

                                                Acciones

                                            </th>

                                        </tr>

                                    </thead>



                                    <tbody>

                                        {integrantesActuales.map((integrante) => (

                                            <tr

                                                key={integrante.id}

                                                className="transition-colors hover:bg-base-200/50"

                                            >

                                                <td className="pl-6">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">

                                                            {(

                                                                integrante.usuario_nombres ||

                                                                integrante.usuario_username

                                                            )

                                                                .charAt(0)

                                                                .toUpperCase()}

                                                        </div>



                                                        <div>

                                                            <p className="font-semibold">

                                                                {[

                                                                    integrante.usuario_nombres,

                                                                    integrante.usuario_apellido_paterno,

                                                                ]

                                                                    .filter(Boolean)

                                                                    .join(' ') || '-'}

                                                            </p>



                                                            <p className="text-xs text-base-content/50">

                                                                Integrante de directiva

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>



                                                <td className="font-medium">

                                                    {integrante.usuario_username}

                                                </td>



                                                <td>

                                                    <span className="badge badge-outline">

                                                        {integrante.cargo_nombre}

                                                    </span>

                                                </td>



                                                <td>

                                                    {integrante.activo ? (

                                                        <span className="badge badge-success">

                                                            Activo

                                                        </span>

                                                    ) : (

                                                        <span className="badge badge-ghost">

                                                            Inactivo

                                                        </span>

                                                    )}

                                                </td>



                                                <td className="pr-6">

                                                    <div className="flex justify-end">

                                                        <button

                                                            type="button"

                                                            className="btn btn-sm btn-outline"

                                                            disabled={!puedeGestionar}
                                                            onClick={() => {

                                                                setIntegranteReasignando(integrante)

                                                                setNuevoCargoSeleccionado('')

                                                            }}

                                                        >

                                                            Reasignar cargo

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}



                                        {integrantesActuales.length === 0 && (

                                            <tr>

                                                <td

                                                    colSpan={5}

                                                    className="py-10 text-center text-base-content/60"

                                                >

                                                    {puedeGestionar ? 'No existen integrantes registrados.' : 'Pendiente de habilitación: los integrantes aparecerán cuando se confirme una directiva vigente.'}

                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>



                        {/* Asignar integrante */}

                        <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-500/30 bg-base-100 shadow-sm">

                            <div className="border-b border-base-300 p-6">

                                <div className="flex flex-wrap items-center justify-between gap-4">

                                    <div>

                                        <div className="mb-2 flex flex-wrap items-center gap-3">

                                            <h2 className="text-2xl font-bold">

                                                Asignar integrante

                                            </h2>



                                            <span className="badge badge-primary badge-outline">

                                                Nueva incorporación

                                            </span>

                                        </div>



                                        <p className="text-base-content/60">

                                            Selecciona un usuario elegible y el cargo que ocupará en la directiva.

                                        </p>

                                    </div>

                                </div>

                            </div>



                            <div className="p-6">

                                {!puedeGestionar ? (
                                    <div className="gd-placeholder">
                                        <span className="gd-pending">Pendiente de habilitación</span>
                                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                                            <label className="form-control">
                                                <span className="label-text mb-2 block">Usuario</span>
                                                <select className="select select-bordered w-full" disabled>
                                                    <option>Seleccione un usuario</option>
                                                </select>
                                            </label>
                                            <label className="form-control">
                                                <span className="label-text mb-2 block">Cargo</span>
                                                <select className="select select-bordered w-full" disabled>
                                                    <option>Seleccione un cargo</option>
                                                </select>
                                            </label>
                                        </div>
                                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                                            <button type="button" className="btn btn-primary" disabled>
                                                Asignar integrante
                                            </button>
                                        </div>
                                    </div>
                                ) : usuariosElegibles.length === 0 ? (

                                    <div className="alert">

                                        <span>

                                            No existen usuarios elegibles para asignar a la Directiva.

                                        </span>

                                    </div>

                                ) : (

                                    <>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                            <label className="form-control">

                                                <div className="label">

                                                    <span className="label-text font-semibold">

                                                        Usuario

                                                    </span>

                                                </div>



                                                <select

                                                    className="select select-bordered w-full"

                                                    value={usuarioSeleccionado}

                                                    onChange={(event) =>

                                                        setUsuarioSeleccionado(

                                                            event.target.value,

                                                        )

                                                    }

                                                >

                                                    <option value="">

                                                        Seleccione un usuario

                                                    </option>



                                                    {usuariosElegibles.map((usuario) => (

                                                        <option

                                                            key={usuario.id}

                                                            value={usuario.id}

                                                        >

                                                            {[

                                                                usuario.nombres,

                                                                usuario.apellido_paterno,

                                                            ]

                                                                .filter(Boolean)

                                                                .join(' ') || usuario.username}

                                                        </option>

                                                    ))}

                                                </select>

                                            </label>



                                            <label className="form-control">

                                                <div className="label">

                                                    <span className="label-text font-semibold">

                                                        Cargo

                                                    </span>

                                                </div>



                                                <select

                                                    className="select select-bordered w-full"

                                                    value={cargoSeleccionado}

                                                    onChange={(event) =>

                                                        setCargoSeleccionado(

                                                            event.target.value,

                                                        )

                                                    }

                                                >

                                                    <option value="">

                                                        Seleccione un cargo

                                                    </option>



                                                    {cargos.map((cargo) => (

                                                        <option

                                                            key={cargo.id}

                                                            value={cargo.id}

                                                        >

                                                            {cargo.nombre}

                                                        </option>

                                                    ))}

                                                </select>

                                            </label>

                                        </div>



                                        <div className="mt-6 flex justify-end border-t border-base-300 pt-6">

                                            <button

                                                type="button"

                                                className="btn btn-primary"

                                                disabled={

                                                    !puedeGestionar ||
                                                    guardandoAsignacion ||

                                                    !usuarioSeleccionado ||

                                                    !cargoSeleccionado

                                                }

                                                onClick={() =>

                                                    void asignarIntegrante()

                                                }

                                            >

                                                {guardandoAsignacion && (

                                                    <span className="loading loading-spinner loading-sm" />

                                                )}



                                                {guardandoAsignacion

                                                    ? 'Asignando...'

                                                    : 'Asignar integrante'}

                                            </button>

                                        </div>

                                    </>

                                )}

                            </div>

                        </div>



                        {/* Reasignación de cargo */}

                        {!puedeGestionar && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                                <div className="border-b border-base-300 p-6">
                                    <h2 className="text-2xl font-bold">Reasignación de cargo</h2>
                                    <p className="mt-2 text-base-content/60">
                                        Cambia el cargo de un integrante activo de la directiva.
                                    </p>
                                </div>
                                <div className="p-6">
                                    <span className="gd-pending">Pendiente de habilitación</span>
                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div className="gd-placeholder">Integrante: sin asignar</div>
                                        <div className="gd-placeholder">Cargo actual: sin asignar</div>
                                    </div>
                                    <label className="form-control mt-5 block">
                                        <span className="label-text mb-2 block">Nuevo cargo</span>
                                        <select className="select select-bordered w-full" disabled>
                                            <option>Seleccione un cargo</option>
                                        </select>
                                    </label>
                                    <div className="mt-6 flex justify-end border-t border-base-300 pt-6">
                                        <button type="button" className="btn btn-primary" disabled>
                                            Confirmar reasignación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {puedeGestionar && integranteReasignando && (

                            <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-base-100 shadow-sm">

                                <div className="border-b border-base-300 p-6">

                                    <div className="flex flex-wrap items-center justify-between gap-4">

                                        <div>

                                            <div className="mb-2 flex flex-wrap items-center gap-3">

                                                <h2 className="text-2xl font-bold">

                                                    Reasignar cargo

                                                </h2>



                                                <span className="badge badge-warning badge-outline">

                                                    Cambio de cargo

                                                </span>

                                            </div>



                                            <p className="text-base-content/60">

                                                Selecciona el nuevo cargo para el integrante indicado.

                                            </p>

                                        </div>

                                    </div>

                                </div>



                                <div className="p-6">

                                    <div className="mb-5 grid gap-4 sm:grid-cols-2">

                                        <div className="rounded-xl bg-base-200/60 p-4">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">

                                                Usuario

                                            </p>



                                            <p className="mt-1 font-semibold">

                                                {integranteReasignando.usuario_username}

                                            </p>

                                        </div>



                                        <div className="rounded-xl bg-base-200/60 p-4">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">

                                                Cargo actual

                                            </p>



                                            <p className="mt-1 font-semibold">

                                                {integranteReasignando.cargo_nombre}

                                            </p>

                                        </div>

                                    </div>



                                    <label className="form-control">

                                        <div className="label">

                                            <span className="label-text font-semibold">

                                                Nuevo cargo

                                            </span>

                                        </div>



                                        <select

                                            className="select select-bordered w-full"

                                            value={nuevoCargoSeleccionado}

                                            onChange={(event) =>

                                                setNuevoCargoSeleccionado(

                                                    event.target.value,

                                                )

                                            }

                                        >

                                            <option value="">

                                                Seleccione un cargo

                                            </option>



                                            {cargos

                                                .filter((cargo) => {

                                                    if (

                                                        cargo.id === integranteReasignando.cargo

                                                    ) {

                                                        return false

                                                    }



                                                    if (cargo.permite_multiples) {

                                                        return true

                                                    }



                                                    const cargoOcupado =

                                                        integrantesActuales.some(

                                                            (integrante) =>

                                                                integrante.activo &&

                                                                integrante.cargo === cargo.id &&

                                                                integrante.id !==

                                                                integranteReasignando.id,

                                                        )



                                                    return !cargoOcupado

                                                })

                                                .map((cargo) => (

                                                    <option

                                                        key={cargo.id}

                                                        value={cargo.id}

                                                    >

                                                        {cargo.nombre}

                                                    </option>

                                                ))}

                                        </select>

                                    </label>



                                    {cargos.filter((cargo) => {

                                        if (

                                            cargo.id === integranteReasignando.cargo

                                        ) {

                                            return false

                                        }



                                        if (cargo.permite_multiples) {

                                            return true

                                        }



                                        return !integrantesActuales.some(

                                            (integrante) =>

                                                integrante.activo &&

                                                integrante.cargo === cargo.id &&

                                                integrante.id !==

                                                integranteReasignando.id,

                                        )

                                    }).length === 0 && (

                                        <div className="alert alert-warning mt-4">

                                            <span>

                                                No existen otros cargos disponibles para reasignar.

                                            </span>

                                        </div>

                                    )}



                                    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-base-300 pt-6">

                                        <button

                                            type="button"

                                            className="btn btn-outline"

                                            disabled={reasignandoCargo}

                                            onClick={() => {

                                                setIntegranteReasignando(null)

                                                setNuevoCargoSeleccionado('')

                                            }}

                                        >

                                            Cancelar

                                        </button>



                                        <button

                                            type="button"

                                            className="btn btn-primary"

                                            disabled={

                                                !puedeGestionar ||
                                                reasignandoCargo ||

                                                !nuevoCargoSeleccionado

                                            }

                                            onClick={() =>

                                                void reasignarCargoIntegrante()

                                            }

                                        >

                                            {reasignandoCargo && (

                                                <span className="loading loading-spinner loading-sm" />

                                            )}



                                            {reasignandoCargo

                                                ? 'Reasignando...'

                                                : 'Confirmar reasignación'}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}



                        {/* Usuarios elegibles */}

                        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

                            <div className="border-b border-base-300 p-6">

                                <div className="flex flex-wrap items-center justify-between gap-4">

                                    <div>

                                        <h2 className="text-2xl font-bold">

                                            Usuarios elegibles

                                        </h2>



                                        <p className="mt-1 text-base-content/60">

                                            Vecinos que actualmente pueden ser asignados a la directiva.

                                        </p>

                                    </div>



                                    <span className="badge badge-outline badge-lg">

                                        {usuariosElegibles.length}{' '}

                                        {usuariosElegibles.length === 1

                                            ? 'disponible'

                                            : 'disponibles'}

                                    </span>

                                </div>

                            </div>



                            <div className="overflow-x-auto">

                                <table className="table min-w-[760px]">

                                    <thead className="bg-base-200/60">

                                        <tr>

                                            <th className="pl-6">Nombre</th>

                                            <th>Usuario</th>

                                            <th>RUT</th>

                                            <th className="pr-6">Sector</th>

                                        </tr>

                                    </thead>



                                    <tbody>

                                        {usuariosElegibles.map((usuario) => (

                                            <tr

                                                key={usuario.id}

                                                className="transition-colors hover:bg-base-200/50"

                                            >

                                                <td className="pl-6">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-700">

                                                            {(

                                                                usuario.nombres ||

                                                                usuario.username

                                                            )

                                                                .charAt(0)

                                                                .toUpperCase()}

                                                        </div>



                                                        <div>

                                                            <p className="font-semibold">

                                                                {[

                                                                    usuario.nombres,

                                                                    usuario.apellido_paterno,

                                                                    usuario.apellido_materno,

                                                                ]

                                                                    .filter(Boolean)

                                                                    .join(' ') || '-'}

                                                            </p>



                                                            <p className="text-xs text-base-content/50">

                                                                {usuario.email}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>



                                                <td className="font-medium">

                                                    {usuario.username}

                                                </td>



                                                <td>

                                                    {usuario.rut ?? '-'}

                                                </td>



                                                <td className="pr-6">

                                                    <span className="badge badge-ghost">

                                                        {usuario.sector_nombre}

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}



                                        {usuariosElegibles.length === 0 && (

                                            <tr>

                                                <td

                                                    colSpan={4}

                                                    className="py-10 text-center text-base-content/60"

                                                >

                                                    {puedeGestionar ? 'No existen usuarios elegibles para asignar a la Directiva.' : 'Pendiente de habilitación: no se han cargado usuarios elegibles.'}

                                                </td>

                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </>

                )}

            </section>

        </main>

    )

}



export default GestionDirectivaPage
