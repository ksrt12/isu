import { BrowserRouter, Switch, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MergePage from "./pages/MergePage";
import "./app.scss";

const App: React.FC = () => {
    return (
        <>
            <BrowserRouter>
                <Switch>
                    <Route component={MainPage} path="/" exact />
                    <Route component={MergePage} path="/json2xls" />
                </Switch>
            </BrowserRouter>

            <div className="copyright">
                <a target="_blank" rel="noreferrer" href="https://vk.com/kazakovstepan">&copy; 2020-2021, kazakovstepan</a>
            </div>
        </>
    );
};

export default App;