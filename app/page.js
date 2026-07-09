"use client";
export default function Home() {
  const sendreq = async () => {
    const res = await fetch("api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log(res);
  };

  return (
    <>
      <div className="flex flex-col">
        <div>Homepage</div>

        <input
          className=" h-10 bg-neutral-800 p-5 m-3"
          placeholder="Enter your text here"
        />

        <button onClick={sendreq} className="px-3 py-2 m-3 bg-red-500">
          Send Request
        </button>
      </div>
    </>
  );
}
