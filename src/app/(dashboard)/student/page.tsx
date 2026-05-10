import ActivityChart from "./_components/activityChart";
import CourceActivites from "./_components/courseActivites";
import CourseProgressList from "./_components/courseProgressList";
import MyPlanning from "./_components/myPlanning";
import Statistics from "./_components/statistics";
import TopTutors from "./_components/topTutors";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <section className="flex gap-7 xl:flex-row flex-col-reverse py-4">
      <div className="flex-[2] flex flex-col gap-5">
        <ActivityChart />
        <div className="flex gap-4 md:flex-row flex-col">
          <Statistics />
          <CourceActivites />
        </div>
        <TopTutors />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <MyPlanning />
        <CourseProgressList />
      </div>
    </section>
  );
};

export default Dashboard;
