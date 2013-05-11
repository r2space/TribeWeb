
var async = require("async")
  , _ = require("underscore")
  , shortmail = require('../modules/mod_shortmail')
  , ctrl_user = lib.ctrl.user;

exports.getMailUser = function(_id, callback_){

  var tasks = [];
  var task_getUsers = function(cb){

  shortmail.getMailUser2(_id, function(err, users){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, users);
      }
    });
  };
  tasks.push(task_getUsers);
  
  async.waterfall(tasks,function(err,users){
    return callback_(err, users);
  });
};

exports.getContacts = function(uid_, firstLetter_, start_, limit_, callback_){

  var tasks = [];
  var task_getUsers = function(cb){
    ctrl_user.getUserList("all", firstLetter_, uid_, start_, limit_, function(err, users){
      err = err ? new error.InternalServer(err) : null;
      if (err) {
        return callback_(err);
      } else {
        cb(err, {contact: users});
      }
    });
  };
  tasks.push(task_getUsers);

  var task_getLastMail = function(result, cb){
    async.forEach(result.contact, function(user,cb_){
      shortmail.getLastMail(uid_, user._id, function(err, mail){
        if(mail.length>0){
          user._doc["lastMail"] = mail[0]; 
        }
        cb_(err);
      });
    }
    , function(err){
      cb(err, result);
    });
  };
  tasks.push(task_getLastMail);

  var task_getUnreadCount = function(result, cb){
    async.forEach(result.contact, function(user,cb_){
      shortmail.getUnreadCount(uid_, user._id, function(err, count){
        user._doc["unreadCount"] = count; 
        cb_(err);
      });
    }
    , function(err){
      cb(err,result);
    });
    
  };
  tasks.push(task_getUnreadCount);

  var task_done = function(err, result){
    return callback_(err, result);
  };

  async.waterfall(tasks,task_done);
};


exports.getEarlierMails = function(_id, _uid, _date, callback_){

  shortmail.getEarlierMails(_id, _uid, _date, function(err, mails){

    if (err) {
      return callback_(err);
    };

    ctrl_user.appendUser(mails, "createby", function(err, result){
      callback_(err, result);
    });

  });
};

// 获取与指定人的对话
exports.getMailList = function(_id, _uid, callback_){

  shortmail.getMailList(_id, _uid, function(err, mails) {

    if (err) {
      return callback_(err);
    };

    ctrl_user.appendUser(mails, "createby", function(err, result){
      callback_(err, result);
    });
  });
};


// add by li
exports.unread = function(uid_, callback_) {
  shortmail.unread(uid_, function(err, result){
    callback_(err, result);
  });
}

exports.create = function(mail_, callback_) {
  shortmail.create(mail_, function(err, result){
    callback_(err, result);
  });
}




