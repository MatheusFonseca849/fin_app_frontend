import Header from "@/app/components/Header";
import FabMenu from "@/app/components/FabMenu";

const MainLayout = ({children}: {children: React.ReactNode}) => {

    return (
        <div>
            <Header />
            {children}
            <FabMenu />
        </div>
    )
}

export default MainLayout