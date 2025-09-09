import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
    return (
        <div className="container-mobile py-24 text-center space-y-4">
            <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
            <Link to="/community"><Button>커뮤니티 홈</Button></Link>
        </div>
    );
}
