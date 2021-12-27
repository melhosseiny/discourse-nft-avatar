# frozen_string_literal: true

# name: discourse-nft-avatar
# about: Set a verified NFT avatar
# version: 0.0.1
# authors: Mostafa Elshamy
# url: https://github.com/melhosseiny/discourse-nft-avatar
# required_version: 2.7.0
# transpile_js: true

enabled_site_setting :nft_avatar_enabled

register_asset 'stylesheets/common.scss'
register_asset 'stylesheets/desktop.scss', :desktop
register_asset 'stylesheets/mobile.scss', :mobile

DiscoursePluginRegistry.serialized_current_user_fields << "nft_verified"
DiscoursePluginRegistry.serialized_current_user_fields << "nft_token_id"
DiscoursePluginRegistry.serialized_current_user_fields << "nft_contract_address"

after_initialize do
  User.register_custom_field_type('nft_verified', :boolean)
  User.register_custom_field_type('nft_token_id', :text)
  User.register_custom_field_type('nft_contract_address', :text)

  register_editable_user_custom_field [:nft_verified, :nft_token_id, :nft_contract_address]

  allow_public_user_custom_field :nft_verified

  add_to_serializer(:user, :nft_verified, false) { object.custom_fields['nft_verified'] }
  add_to_serializer(:user, :nft_token_id, false) { object.custom_fields['nft_token_id'] }
  add_to_serializer(:user, :nft_contract_address, false) { object.custom_fields['nft_contract_address'] }

  add_to_serializer(:post, :user_nft_verified, false) {
    object.user.custom_fields['nft_verified'] if object.user
  }

  add_to_serializer(:topic_poster, :user_nft_verified, false) {
    object.user.custom_fields['nft_verified'] if object.user
  }

  add_to_serializer(:topic_post_count, :user_nft_verified, false) {
    object[:user].custom_fields['nft_verified'] if object[:user]
  }

  require_dependency 'topic_post_count_serializer'
  class ::TopicPostCountSerializer
    attributes :custom_fields

    def custom_fields
      object[:user].custom_fields
    end
  end

  require_dependency 'poster_serializer'
  class ::PosterSerializer
    attributes :custom_fields

    def custom_fields
      object.custom_fields
    end
  end
end
