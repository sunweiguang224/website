/**
 * 功能: 开发者编译参数配置
 * 说明: 将编译参数配置到当前配置文件后，无需手动从命令行输入编译参数
 * 命令行指定编译参数示例:
 *  (npm run dev -- --env_stage dev --env_num 6)
 *  (npm run build -- --env_stage dev --env_num 6)
 * config参数说明：
 * env_stage            当前开发阶段，取值范围: 'dev'|'beta'|'gray'|'prod'，默认'prod'
 * env_num              当前开发分支，取值范围: ''|1|2|3|4|5|6|7|8|9，默认''
 * page                 src/page/目录下需要编译的页面，如'*'表示所有页面，'center'表示单页面，
 *                      '{center,center_edit}'表示个人中心页面和个人中心编辑页面。
 *                      开发时将*行注释,只配置要编译的页面,可提高编译速度，默认'*'
 * webpack              是否需要编译html分离前的js(webpack.config.js)，默认true
 */
export default {
  //env_stage: 'beta',
  //env_num: '2',
  // page: 'act_1018_main',
};
