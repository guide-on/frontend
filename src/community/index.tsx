import { Routes, Route, Navigate } from "react-router-dom";
import CommunityLayout from "./layouts/CommunityLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import SearchResults from "./pages/SearchResults";
import CaseList from "./pages/CaseList";
import FreeboardList from "./pages/FreeboardList";
import PostDetail from "./pages/PostDetail";
import PostCreate from "./pages/PostCreate";
import PostEdit from "./pages/PostEdit";
import NotFound from "./pages/NotFound";

export default function Community() {
    return (
        <Routes>
            <Route element={<CommunityLayout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="search/results" element={<SearchResults />} />
                <Route path="cases" element={<CaseList />} />
                <Route path="freeboard" element={<FreeboardList />} />
                <Route path="posts/new" element={<PostCreate />} />
                <Route path="posts/:id" element={<PostDetail />} />
                <Route path="posts/:id/edit" element={<PostEdit />} />
                <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
    );
}
