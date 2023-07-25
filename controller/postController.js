const Post = require('../model/Post')

exports.viewCreatePage = (req,res)=>{
    res.render('create-post')
}

exports.createPost = (req, res) => {
    let post = new Post(req.body, req.session.user._id)
    post.createPost().then((newId)=>{
         req.session.save(()=>res.redirect(`/post/${newId}`))
    }).catch(err =>{
        res.send(err)
    })
}

exports.viewSingle = async (req, res)=>{
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        console.log("post",post)
        res.render('single-post-screen', {post: post})
    }catch{
        res.render('404')
    }
}

exports.viewEditScreen = async (req, res)=>{
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        if(post.isVisitorOwner){
            res.render('edit-post', {post: post})
        }else{
            req.flash("errors", "You don't have permission to perform this action")
            req.session.save(() => res.redirect("/"))
        }
    }catch{
        res.render('404')
    }
}

exports.edit = async (req, res) => {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status)=>{
        if(status == 'success'){
            req.flash('success', "post successfully updated")
            req.session.save(()=>res.redirect(`/post/${req.params.id}/edit`))
        }else{
            post.errors.forEach(err =>{
                req.flash('errors', err)
            })
            req.session.save(()=>res.redirect(`/post/${req.params.id}/edit`))
        }
    }).catch(()=>{
        // a post with the requested i doesn't exist
        // or if the visitor is not owner
        req.flash('errors', "You do not have permission to peform that action")
        req.session.save(()=>res.redirect('/'))
    })
}

exports.search = async (req, res)=>{
    // console.log(req.body.searchTerm)
    Post.search(req.body.searchTerm).then(posts => {
        // console.log(posts)
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}