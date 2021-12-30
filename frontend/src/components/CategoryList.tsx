// react hooks
import { useEffect } from "react";

// redux
import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  useAddClipCategoryMutation,
  useCategoriesQuery,
  useClipQuery,
  useDeleteClipCategoryMutation,
} from "../redux/api";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addCategory,
  removeCategory,
  setCategories,
} from "../redux/categoryList";

// components
import SectionHeader from "./SectionHeader";

const CategoryList = () => {
  const { data: categories } = useCategoriesQuery();

  const id = useAppSelector((state) => state.clipList.selected);
  const { data: clip } = useClipQuery(id ?? skipToken);

  const selectedCategories = useAppSelector(
    (state) => state.categoryList.selected
  );

  const [addClipCategory] = useAddClipCategoryMutation();
  const [deleteClipCategory] = useDeleteClipCategoryMutation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const categories = clip?.categories?.map((category) => category.id);
    dispatch(setCategories(categories ?? []));
  }, [clip, dispatch]);

  const updateCategory = async (categoryId: number, enabled: boolean) => {
    if (id && categories) {
      const params = {
        clip_id: id,
        category_id: categoryId,
      };

      if (enabled) {
        await addClipCategory(params);
      } else {
        await deleteClipCategory(params);
      }
    }
  };

  return (
    <section className="border-2 border-solid border-black mx-2 p-2">
      <SectionHeader title="Categories" />
      <form>
        <div className="h-[25rem] border border-blue-500 border-solid p-2">
          <div className="h-full overflow-y-scroll p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
            {categories?.map((category) => (
              <div key={category.id}>
                <label>
                  <input
                    type="checkbox"
                    name="categories"
                    value={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      const categoryId = +e.target.value;

                      updateCategory(categoryId, e.target.checked);

                      if (e.target.checked) {
                        dispatch(addCategory(categoryId));
                      } else {
                        dispatch(removeCategory(categoryId));
                      }
                    }}
                  />{" "}
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
};

export default CategoryList;
