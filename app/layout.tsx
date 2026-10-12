import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'NutriBalance · Tu consultorio, en orden',description:'Gestión nutricional y portal del paciente. Demostración interactiva.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><body>{children}</body></html>}
