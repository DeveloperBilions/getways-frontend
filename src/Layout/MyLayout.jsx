import {Layout} from "react-admin";
import MyAppBar from "./MyAppBar";
import { MySidebar } from "./MySidebar";

export const MyLayout = props => <Layout {...props} 
    appBar={MyAppBar} 
    sidebar={MySidebar}
/>;