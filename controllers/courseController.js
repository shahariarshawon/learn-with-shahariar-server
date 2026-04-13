import Course from "../models/Course.js";

// get all courses

export const getAllCourse = async (req,res) => {
    try {
        const courses = await Course.find({isPublished: true}).select(['-courseContent','-enrolledStudents']).populate({path: 'educator'})
        
        

        res.json ({success: true, courses})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


// get course by id

export const getCourseId = async(req,res)=>{
    const {id} = req.params 
    try {

        const courseData = await Course.findById(id).populate({path:'educator'});

        // Remove lecture Url if previewFrese is false

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })

        res.json({success:true, courseData})
        
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// \for updating the course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    // merge update safely
    Object.keys(updateData).forEach((key) => {
      course[key] = updateData[key];
    });

    await course.save();

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.auth.userId;

    // console.log("LOGGED USER:", educatorId);

    const courses = await Course.find({ educator: educatorId });

    return res.json({
      success: true,
      courses,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const addChapter = async (req, res) => {
  try {
    const { courseId, chapter } = req.body;

    if (!courseId || !chapter) {
      return res.json({ success: false, message: "Missing data" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    course.courseContent.push(chapter);

    await course.save();

    res.json({ success: true, message: "Chapter added", course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addLecture = async (req, res) => {
  try {
    const { courseId, chapterId, lecture } = req.body;

    if (!courseId || !chapterId || !lecture) {
      return res.json({ success: false, message: "Missing data" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const chapter = course.courseContent.find(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapter) {
      return res.json({ success: false, message: "Chapter not found" });
    }

    chapter.chapterContent.push(lecture);

    await course.save();

    res.json({ success: true, message: "Lecture added", course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};