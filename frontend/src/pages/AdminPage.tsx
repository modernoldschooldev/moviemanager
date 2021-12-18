const AdminPage = () => {
  return (
    <div className="border border-black mx-auto p-4 w-max">
      <form>
        <div className="mb-3">
          <label>
            <input className="mx-1" type="radio" name="selection" />
            Actor
          </label>
          <label>
            <input className="mx-1" type="radio" name="selection" />
            Category
          </label>
          <label>
            <input className="mx-1" type="radio" name="selection" />
            Series
          </label>
          <label>
            <input className="mx-1" type="radio" name="selection" />
            Studio
          </label>
        </div>

        <div className="my-3">
          <input
            className="border border-black focus:bg-gray-100 px-2 rounded-xl w-full"
            type="text"
          />
        </div>

        <div className="grid mt-3">
          <button
            className="bg-green-700 hover:bg-green-600 font-semibold p-2 text-center text-white tracking-wider uppercase"
            type="submit"
          >
            Add Something...
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;
