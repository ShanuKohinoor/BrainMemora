import { Button } from "../components/Button"
import { DashboardLayout } from "../components/DashboardLayout"
export default function Dashboard(){
    return(
        <>
        <DashboardLayout>
        <h1>
          Welcome to Dashboard Page
        </h1>
        <Button label="Click me"/>
        </DashboardLayout>

        </>
    )
}