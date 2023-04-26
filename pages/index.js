import Layout from "@/components/Layout";
import withoutAuth from "@/components/routes/PublicRoute";

function Home() {
  return (
    <Layout>
      <div className="max-w-6xl m-auto">
        <div className="mb-8">
          <img className="w-full h-96 rounded-md" src="/banner.jpg" />
        </div>
        <div className="max-w-5xl m-auto">
          <h2 className="mb-10 font-medium text-3xl text-[#444444]">Welcome to Agreely</h2>
          <div>
            <p className="mb-4 font-light text-lg">As a builder, our job is to bring ideas and plans to life by constructing buildings, homes, and other structures. I work with architects, engineers, and other construction professionals to ensure that every project is completed to the highest standards of quality and safety.</p>
            <p className="mb-4 font-light text-lg">Our work starts with the foundation, which is crucial to the stability and durability of any structure. We use concrete, steel, and other materials to create a solid base that will support the weight of the building above. From there, We frame the walls, roof, and floors using wood, steel, or other materials depending on the design and specifications.</p>
            <p className="mb-4 font-light text-lg">Throughout the construction process, We pay close attention to every detail to ensure that everything is built to code and meets the client's requirements. This includes installing electrical and plumbing systems, as well as finishing work like painting, flooring, and trim.</p>
            <p className="mb-4 font-light text-lg">As a builder, We take great pride in our work and strive to deliver exceptional results on every project. We am committed to staying up-to-date on the latest construction techniques and technologies to ensure that We am always providing the best possible service to our clients.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withoutAuth(Home);