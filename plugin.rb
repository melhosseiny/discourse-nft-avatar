# name: discourse-nft-avatar
# about: Set a verified NFT avatar
# version: 0.0.1
# authors: Mostafa Elshamy
# url: https://github.com/melhosseiny/discourse-nft-avatar

enabled_site_setting :awesomeness_enabled

add_admin_route 'nft_avatar.title', 'nft-avatar'
register_asset 'stylesheets/common/common.scss'
register_asset 'stylesheets/desktop/desktop.scss', :desktop
register_asset 'stylesheets/mobile/mobile.scss', :mobile

Discourse::Application.routes.append do
  get '/admin/plugins/nft-avatar' => 'admin/plugins#index', constraints: StaffConstraint.new
end
