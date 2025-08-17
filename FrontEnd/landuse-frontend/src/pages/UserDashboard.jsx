import TopBar from "../components/TopBar.jsx";
import { useNavigate, Link } from "react-router-dom";

export default function UserDashboard() {
  const nav = useNavigate();
  return (
    <div>
      <TopBar title="لوحة المستخدم" />
      <div className="container mt-3">
        <div className="cardx">
          <div className="h1">مرحبًا</div>
          <p className="p">تقدر تبدأ بإضافة تصريح جديد أو تستعرض تصاريحك السابقة.</p>
          <div className="d-flex gap-2">
            <Link className="btn btn-primary" to="/user/permits/new">إضافة تصريح</Link>
            <button className="btn btn-outline-light" onClick={() => nav("/user/permits")}>تصاريحي السابقة</button>
          </div>
        </div>
      </div>
    </div>
  );
}